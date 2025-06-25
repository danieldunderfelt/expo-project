import { useMutation } from '@tanstack/react-query'
import { api } from '~/data/api.ts'
import { orderChanges, orders } from '~/data/db/schema.ts'
import { db } from '~/data/db/setup.ts'
import { applyOrderChanges } from '~/data/orders/applyOrderChanges.ts'
import { useSync } from '~/data/sync.tsx'
import type { InsertOrderChange } from '~/data/types.ts'
import { inArray } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useMemo } from 'react'

export function useOrders() {
  const { data: ordersData, error: ordersError } = useLiveQuery(
    db.select().from(orders),
  )

  const { data: orderChangesData, error: orderChangesError } = useLiveQuery(
    db.select().from(orderChanges),
  )

  if (ordersError) {
    console.error('orders error', ordersError)
  }

  if (orderChangesError) {
    console.error('order changes error', orderChangesError)
  }

  const fullOrdersData = useMemo(
    () =>
      (ordersData || []).map(
        (order) =>
          applyOrderChanges(order, orderChangesData || []).changedOrder,
      ),
    [ordersData, orderChangesData],
  )

  return {
    orders: fullOrdersData || [],
    changes: orderChangesData || [],
    error: ordersError || orderChangesError,
  }
}

export function useAddChange() {
  const {
    mutateAsync: addChange,
    isPending,
    error,
  } = useMutation({
    mutationFn: (change: InsertOrderChange) =>
      db
        .insert(orderChanges)
        .values({
          ...change,
          changeValue: Number(change.changeValue),
          updatedAt: Date.now(),
        })
        .onConflictDoUpdate({
          target: [orderChanges.orderId, orderChanges.changeKey],
          set: {
            changeValue: Number(change.changeValue),
            updatedAt: Date.now(),
          },
        })
        .returning()
        .then(([change]) => change),
  })

  return {
    addChange,
    isPending,
    error,
  }
}

export function useSaveChanges() {
  const { syncOrders } = useSync()

  const {
    mutate: saveChanges,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      const pendingChanges = await db.select().from(orderChanges)

      const changes = pendingChanges.map((change) => ({
        changeKey: change.changeKey,
        changeValue: change.changeValue,
        orderId: change.orderId,
      }))

      await api.orders.applyChanges(changes)
      await syncOrders()

      await db.delete(orderChanges).where(
        inArray(
          orderChanges.id,
          pendingChanges.map((change) => change.id),
        ),
      )
    },
    onSuccess: async () => {
      console.log('changes saved')
    },
    onError: (error) => {
      console.error('error saving changes', error)
    },
  })

  return {
    saveChanges,
    isPending,
    error,
  }
}
