import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId/index'
import { OrderModel } from '~/data/models/OrderModel.ts'
import { ProductModel } from '~/data/models/ProductModel.ts'
import { schema } from '~/data/schemas/appSchema'
import { v4 as uuidv4 } from 'uuid'

setGenerator(() => uuidv4())

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
})

const database = new Database({
  adapter,
  modelClasses: [OrderModel, ProductModel],
})
