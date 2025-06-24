import type { ApiOrder, Product } from '~/data/types.ts'

// --- IN-MEMORY DATABASE ---
const products: Product[] = []
const orders: ApiOrder[] = []

// --- DATA GENERATION ---
const productNames = [
  'Organic Apples',
  'Whole Wheat Bread',
  'Free-Range Eggs',
  'Almond Milk',
  'Grass-Fed Beef',
  'Wild Salmon',
  'Quinoa',
  'Spinach',
  'Avocado',
  'Dark Chocolate',
]
const units: ApiOrder['unit'][] = ['kg', 'pcs', 'liter']
const department = 'Groceries'

const generateMockData = () => {
  console.log('Generating mock data...')
  const now = Date.now()

  // Generate products
  for (let i = 0; i < 10; i++) {
    products.push({
      id: crypto.randomUUID(),
      name: productNames[i % productNames.length],
      price: Number.parseFloat((Math.random() * 50 + 5).toFixed(2)),
      created_at: now,
      updated_at: now,
    })
  }

  // Generate orders
  for (let i = 0; i < 10000; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    orders.push({
      id: crypto.randomUUID(),
      name: `Order #${i + 1}`,
      product_id: product.id,
      quantity: Math.floor(Math.random() * 10) + 1,
      unit: units[Math.floor(Math.random() * units.length)],
      department,
      updated_at: now,
    })
  }

  console.log(
    `Generated ${products.length} products and ${orders.length} orders.`,
  )
}

// --- HELPERS ---
const applyFilters = <T extends Record<string, unknown>>(
  data: T[],
  query: URLSearchParams,
): T[] => {
  let filteredData = [...data]
  query.forEach((value, key) => {
    // Handle 'greater than' filters, e.g., updated_at_since=...
    if (key.endsWith('_since')) {
      const field = key.replace('_since', '')
      if (data.length > 0 && !(field in data[0])) {
        return
      }
      filteredData = filteredData.filter((item) => {
        const itemValue = item[field]
        return typeof itemValue === 'number' && itemValue > Number(value)
      })
      return // Continue to next query param
    }

    if (data.length === 0 || !(key in data[0])) {
      return
    }
    filteredData = filteredData.filter((item) => {
      const itemValue = item[key]
      // Case-insensitive compare for strings
      if (typeof itemValue === 'string' && typeof value === 'string') {
        return itemValue.toLowerCase() === value.toLowerCase()
      }
      if (typeof itemValue === 'number') {
        return itemValue === Number(value)
      }
      // Compare other types as strings
      return String(itemValue) === value
    })
  })
  return filteredData
}

// --- SERVER ---
const port = 3000

const server = Bun.serve({
  port,
  async fetch(req: Request) {
    const url = new URL(req.url)
    const { pathname, searchParams } = url
    const segments = pathname.split('/').filter(Boolean)

    console.log(`[${req.method}] ${pathname}${url.search}`)

    if (segments.length === 0) {
      return new Response('Mock server is running. Try /products or /orders', {
        status: 200,
      })
    }

    const resource = segments[0]
    const id = segments[1]

    try {
      // GET /resource or /resource?field=value
      if (req.method === 'GET') {
        if (resource === 'products') {
          if (id) {
            const item = products.find((p) => p.id === id)
            return item
              ? new Response(JSON.stringify(item), {
                  headers: { 'Content-Type': 'application/json' },
                })
              : new Response(JSON.stringify({ error: 'Not Found' }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
                })
          }
          const filteredData = applyFilters(products, searchParams)
          return new Response(JSON.stringify(filteredData), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
        if (resource === 'orders') {
          if (id) {
            const item = orders.find((o) => o.id === id)
            return item
              ? new Response(JSON.stringify(item), {
                  headers: { 'Content-Type': 'application/json' },
                })
              : new Response(JSON.stringify({ error: 'Not Found' }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
                })
          }

          const filteredData = applyFilters(orders, searchParams)

          return new Response(JSON.stringify(filteredData), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }

      // UPDATE /resource/:id
      if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
        const updateData = await req.json()

        if (resource === 'products') {
          const itemIndex = products.findIndex((item) => item.id === id)
          if (itemIndex > -1) {
            const currentItem = products[itemIndex]
            products[itemIndex] = {
              ...currentItem,
              ...updateData,
              id,
              updated_at: Date.now(),
            }
            return new Response(JSON.stringify(products[itemIndex]), {
              headers: { 'Content-Type': 'application/json' },
            })
          }
        } else if (resource === 'orders') {
          const itemIndex = orders.findIndex((item) => item.id === id)
          if (itemIndex > -1) {
            const currentItem = orders[itemIndex]
            orders[itemIndex] = {
              ...currentItem,
              ...updateData,
              id,
              updated_at: Date.now(),
            }
            return new Response(JSON.stringify(orders[itemIndex]), {
              headers: { 'Content-Type': 'application/json' },
            })
          }
        }
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch (error) {
      console.error(error)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Method Not Allowed or Invalid Endpoint' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } },
    )
  },
  error(error: Error) {
    console.error('Bun server error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  },
})

generateMockData()
console.log(`Mock server listening on http://localhost:${server.port}`)
