import { Model } from '@nozbe/watermelondb'
import { date, field, relation, text } from '@nozbe/watermelondb/decorators'
import type { ProductModel } from '~/data/models/ProductModel.ts'

export class OrderModel extends Model {
  static override table = 'orders'
  static override associations = {
    product: { type: 'belongs_to', key: 'product_id' },
  }

  @text('id') id: string
  @text('name') name: string
  @text('product_id') productId: string
  @field('quantity') quantity: number
  @text('unit') unit: string
  @text('department') department: string
  @date('created_at') createdAt: Date
  @date('updated_at') updatedAt: Date | undefined

  @relation('product', 'product_id') product: ProductModel
}
