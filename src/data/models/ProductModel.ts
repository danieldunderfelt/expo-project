import { Model } from '@nozbe/watermelondb'
import { children, date, field, text } from '@nozbe/watermelondb/decorators'
import type { OrderModel } from '~/data/models/OrderModel'

export class ProductModel extends Model {
  static override table = 'products' // bind the model to specific table
  static override associations = {
    orders: { type: 'has_many', key: 'product_id' },
  }

  @text('id') id: string
  @text('name') name: string
  @field('price') price: number
  @date('created_at') createdAt: Date
  @date('updated_at') updatedAt: Date | undefined

  @children('orders') orders: OrderModel[]
}
