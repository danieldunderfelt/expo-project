import { useMutation } from '@tanstack/react-query'
import { api } from '~/data/api.ts'
import { orderChanges, orders } from '~/data/db/schema.ts'
import { db } from '~/data/db/setup.ts'
import { applyOrderChanges } from '~/data/orders/applyOrderChanges.ts'
import { apiOrderToOrder, type InsertOrderChange } from '~/data/types.ts'
import { eq, inArray } from 'drizzle-orm'
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

      const uniqueOrdersCount = new Set(changes.map((change) => change.orderId))
        .size

      const updatedOrders = await api.orders.applyChanges(changes)

      if (!updatedOrders || updatedOrders.length !== uniqueOrdersCount) {
        throw new Error('Failed to apply changes')
      }

      for (const order of updatedOrders) {
        const { changedFields } = applyOrderChanges(
          apiOrderToOrder(order),
          pendingChanges || [],
        )

        await db
          .update(orders)
          .set({
            name: order.name,
            productId: order.product_id,
            quantity: order.quantity,
            unit: order.unit,
            department: order.department,
            updatedAt: order.updated_at,
          })
          .where(eq(orders.id, order.id))
      }

      await db.delete(orderChanges).where(
        inArray(
          orderChanges.id,
          pendingChanges.map((change) => change.id),
        ),
      )

      return updatedOrders
    },
  })

  return {
    saveChanges,
    isPending,
    error,
  }
}
