import { observable } from '@legendapp/state'
import type { SyncedGetParams, SyncedSetParams } from '@legendapp/state/sync'
import { syncedCrud } from '@legendapp/state/sync-plugins/crud'
import NetInfo from '@react-native-community/netinfo'
import type { Order } from '~/lib/api'
import { api } from '~/lib/api'

export const orders$ = observable(
  syncedCrud({
    list: (params: SyncedGetParams<Order> & { changesSince?: number }) => {
      const filters: Record<string, string | number> = {}

      if (params.changesSince) {
        // Pass the last sync timestamp to the API to get only new/updated records
        filters.updated_at_since = params.changesSince
      }

      return api.orders.getAll(filters)
    },
    update: (input: Partial<Order>) => {
      if (!input.id) throw new Error('Update requires an id')
      // The API expects only the fields to be updated, not the full object
      const { id, created_at, updated_at, deleted_at, ...rest } = input
      return api.orders.update(id, rest)
    },
    delete: (input: Order) => {
      return api.orders.delete(input.id)
    },
    create: (input: Order, params: SyncedSetParams<Order>) => {
      console.log('create', input, params)
      return Promise.resolve(null)
    },
    updatePartial: true,
    fieldUpdatedAt: 'updated_at',
    fieldCreatedAt: 'created_at',
    changesSince: 'last-sync',
    fieldDeleted: 'deleted_at',
    as: 'array',
    initial: [],
    subscribe: ({ refresh }) => {
      let interval: NodeJS.Timeout | undefined

      const stopPolling = () => {
        if (interval) {
          clearInterval(interval)
          interval = undefined
        }
      }

      const startPolling = () => {
        stopPolling()
        interval = setInterval(() => {
          console.log('[orders$] Polling for updates...')
          refresh()
        }, 1000 * 10)
      }

      const connectionHandler = (isConnected: boolean | null) => {
        if (isConnected) {
          startPolling()
        } else {
          stopPolling()
        }
      }

      // Check initial connection state
      NetInfo.fetch().then((state) => connectionHandler(state.isConnected))

      // Listen for connection changes
      const unsubscribe = NetInfo.addEventListener((state) =>
        connectionHandler(state.isConnected),
      )

      // Return a cleanup function
      return () => {
        unsubscribe()
        stopPolling()
      }
    },
    persist: {},
  }),
)
