import { observable } from '@legendapp/state'
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'
import { observer, use$ } from '@legendapp/state/react'
import { syncObservable } from '@legendapp/state/sync'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/data/api.ts'
import { orders } from '~/data/db/schema.ts'
import { db } from '~/data/db/setup.ts'
import type { ApiOrder } from '~/data/types.ts'
import { createContext, useCallback, useContext, useEffect } from 'react'

export const SyncContext = createContext({
  syncOrders: async () => {},
  flushOrderChanges: () => {},
})

export const syncState$ = observable({
  lastSyncAt: 0,
  syncStartedAt: 0,
})

syncObservable(syncState$, {
  persist: {
    plugin: ObservablePersistMMKV,
    name: 'sync_state',
  },
})

export const SyncProvider = observer(function SyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()

  const { mutateAsync: _syncOrders } = useMutation({
    mutationFn: async () => {
      console.log('syncOrders start')
      syncState$.syncStartedAt.set(Date.now())

      const start = performance.now()
      const nextOrders = await api.orders.getAll()

      const fetchTime = performance.now() - start

      console.log(
        `fetched ${nextOrders?.length || 0} orders in ${fetchTime.toFixed(2)}ms`,
      )

      if (!nextOrders || nextOrders.length === 0) {
        console.log('syncOrders no orders')
        return true
      }

      try {
        const insertStart = performance.now()
        const result = await db.transaction(async (tx) => {
          const deleted = await tx.delete(orders)
          console.log('deleted old orders', deleted.changes)

          const batches = nextOrders.reduce((acc, order, index) => {
            const batch = Math.floor(index / 1000)
            acc[batch] = acc[batch] || []
            acc[batch].push(order)
            return acc
          }, [] as ApiOrder[][])

          let insertedCount = 0

          for (const batch of batches) {
            const inserted = await tx.transaction(async (tx) =>
              tx.insert(orders).values(
                batch.map((order) => ({
                  id: order.id,
                  name: order.name,
                  productId: order.product_id,
                  quantity: order.quantity,
                  unit: order.unit,
                  department: order.department,
                  updatedAt: order.updated_at,
                })),
              ),
            )

            insertedCount += inserted.changes
          }

          if (insertedCount !== nextOrders.length) {
            console.warn(
              'Inserted orders count mismatch. Inserted:',
              insertedCount,
              'Expected:',
              nextOrders.length,
            )
          }

          return true
        })

        const insertTime = performance.now() - insertStart
        const totalTime = performance.now() - start
        console.log(
          `inserted ${nextOrders.length} orders in ${insertTime.toFixed(2)}ms (total: ${totalTime.toFixed(2)}ms)`,
        )

        return result
      } catch (error) {
        console.error('syncOrders error', error)
        return false
      }
    },
    onSuccess: (result) => {
      if (result) {
        syncState$.lastSyncAt.set(Date.now())
        console.log('syncOrders success')
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
    },
    onError: (error) => console.error('syncOrders error', error),
    onSettled: () => syncState$.syncStartedAt.set(0),
  })

  const syncState = use$(syncState$)

  const syncOrders = useCallback(async () => {
    if (syncState.syncStartedAt > 0) {
      return
    }

    await _syncOrders()
  }, [syncState.syncStartedAt, _syncOrders])

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount
  useEffect(() => {
    syncOrders()
  }, [])

  const flushOrderChanges = useCallback(() => {
    console.log('flushOrderChanges')
  }, [])

  return (
    <SyncContext.Provider value={{ syncOrders, flushOrderChanges }}>
      {children}
    </SyncContext.Provider>
  )
})

export function useSync() {
  return useContext(SyncContext)
}
