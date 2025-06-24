import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'expo-crypto'

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    productId: text('product_id').notNull(),
    quantity: integer('quantity').notNull(),
    unit: text('unit').notNull(),
    department: text('department').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('name_idx').on(table.name),
    index('department_idx').on(table.department),
  ],
)

export type Order = typeof orders.$inferSelect

export const orderChanges = sqliteTable(
  'order_changes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    changeKey: text('change_key').notNull(),
    changeValue: text('change_value').notNull(),
    updatedAt: integer('updated_at').notNull(),
    orderId: text('order_id')
      .references(() => orders.id, {
        onDelete: 'cascade',
      })
      .notNull(),
  },
  (table) => [
    index('change_key_idx').on(table.changeKey),
    unique('unique_order_change').on(table.orderId, table.changeKey),
  ],
)

export type OrderChange = typeof orderChanges.$inferSelect
