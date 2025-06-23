import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'id', type: 'number', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        {
          name: 'product_id',
          type: 'string',
          isIndexed: true,
          isOptional: true,
        },
        { name: 'quantity', type: 'number' },
        { name: 'unit', type: 'string' },
        { name: 'department', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'products',
      columns: [
        { name: 'id', type: 'number', isIndexed: true },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'price', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number', isOptional: true },
      ],
    }),
  ],
})
