import type { Order } from '~/data/db/schema.ts'

export type Product = {
  id: string
  name: string
  price: number
  created_at: number
  updated_at: number
}

export type ApiOrder = {
  id: string
  name: string
  product_id: string
  quantity: number
  unit: 'kg' | 'pcs' | 'liter'
  department: string
  updated_at: number
}

export type InsertOrderChange = {
  changeKey: string
  changeValue: number
  orderId: string
}

export function apiOrderToOrder(apiOrder: ApiOrder): Order {
  return {
    id: apiOrder.id,
    name: apiOrder.name,
    productId: apiOrder.product_id,
    quantity: apiOrder.quantity,
    unit: apiOrder.unit,
    department: apiOrder.department,
    updatedAt: apiOrder.updated_at,
  } satisfies Order
}
