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
  changeValue: string
  orderId: string
}
