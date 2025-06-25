import type { Order, OrderChange } from '~/data/db/schema.ts'

export function applyOrderChanges(order: Order, orderChanges: OrderChange[]) {
  const changes = orderChanges.reduce(
    (acc, change) => {
      if (change.orderId === order.id) {
        const prevAppliedChanges = acc.appliedChanges.filter(
          (appliedChange) =>
            appliedChange.changeKey === change.changeKey &&
            appliedChange.updatedAt > change.updatedAt,
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
    changedOrder: {
      ...order,
      ...(changes?.changedFields || {}),
    },
    changedFields: Object.keys(changes?.changedFields || {}),
  }
}
