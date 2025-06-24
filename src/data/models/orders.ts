import {
  orderChanges,
  orders,
  type Order,
  type OrderChange,
} from '~/data/db/schema.ts'
import { db } from '~/data/db/setup.ts'
import type { InsertOrderChange } from '~/data/types.ts'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useCallback, useMemo } from 'react'

export function useOrders() {
  const { data: ordersData, error } = useLiveQuery(db.select().from(orders))
  const { data: orderChangesData, error: orderChangesError } = useLiveQuery(
    db.select().from(orderChanges),
  )

  const fullOrdersData = useMemo(
    () =>
      ordersData?.map((order) => {
        const changes = orderChangesData?.reduce(
          (acc, change) => {
            if (change.orderId === order.id) {
              const prevAppliedChanges = acc.appliedChanges.filter(
                (oc) =>
                  oc.changeKey === change.changeKey &&
                  oc.updatedAt > change.updatedAt,
              )

              if (prevAppliedChanges.length === 0) {
                acc.appliedChanges.push(change)
                acc.changedFields = {
                  ...acc.changedFields,
                  [change.changeKey]: change.changeValue,
                }
              }
            }

            return acc
          },
          {
            appliedChanges: [],
            changedFields: {},
          } as {
            appliedChanges: OrderChange[]
            changedFields: Partial<Order>
          },
        )

        return {
          ...order,
          ...(changes?.changedFields || {}),
        }
      }),
    [ordersData, orderChangesData],
  )

  const addChange = useCallback(
    (change: InsertOrderChange) =>
      db
        .insert(orderChanges)
        .values({
          ...change,
          updatedAt: Date.now(),
        })
        .onConflictDoUpdate({
          target: [orderChanges.orderId, orderChanges.changeKey],
          set: {
            changeValue: change.changeValue,
            updatedAt: Date.now(),
          },
        })
        .returning()
        .then(([change]) => change),
    [],
  )

  return {
    orders: fullOrdersData || [],
    error: error || orderChangesError,
    addChange,
  }
}
