import { LegendList } from '@legendapp/list'
import { observer, use$ } from '@legendapp/state/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import type { Order } from '~/data/db/schema'
import { useAddChange, useOrders } from '~/data/orders/useOrders'
import { syncState$, useSync } from '~/data/sync.tsx'
import { cn } from '~/lib/utils.ts'
import { memo, startTransition, useCallback, useOptimistic } from 'react'
import { ActivityIndicator, View } from 'react-native'

const OrderCard = memo(
  ({ item, className }: { item: Order; className?: string }) => {
    const { addChange } = useAddChange()

    const [quantity, setOptimisticQuantity] = useOptimistic(
      item.quantity,
      (_, newQuantity: number) => newQuantity,
    )

    const handleUpdateQuantity = useCallback(
      async (newQuantity: number) => {
        const quantity = Math.max(
          1,
          Number.isNaN(newQuantity) ? 1 : newQuantity,
        )

        startTransition(async () => {
          setOptimisticQuantity(quantity)

          const change = await addChange({
            changeKey: 'quantity',
            changeValue: quantity,
            orderId: item.id,
          })

          console.log('change', change)
        })
      },
      [addChange, item.id, setOptimisticQuantity],
    )

    const handleIncrement = useCallback(() => {
      handleUpdateQuantity(quantity + 1)
    }, [handleUpdateQuantity, quantity])

    const handleDecrement = useCallback(() => {
      handleUpdateQuantity(quantity - 1)
    }, [handleUpdateQuantity, quantity])

    // This can happen if the item is deleted while the component is still mounted
    if (!item) {
      return null
    }

    return (
      <View
        className={cn(
          'mx-4 mb-4 rounded-lg border border-border bg-card p-4',
          className,
        )}>
        <View className="flex-1">
          <Text className="text-lg font-bold text-card-foreground">
            {item.name}
          </Text>
          <Text className="mb-4 text-sm text-muted-foreground">
            ID: {item.id}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onPress={handleDecrement}
            disabled={quantity <= 1}>
            <Text className="text-xl text-foreground">-</Text>
          </Button>
          <Input
            className="flex-1 text-center text-lg text-card-foreground"
            keyboardType="number-pad"
            value={String(quantity)}
            onChangeText={(text) => {
              handleUpdateQuantity(Number.parseInt(text, 10))
            }}
          />
          <Button variant="outline" size="icon" onPress={handleIncrement}>
            <Text className="text-xl text-foreground">+</Text>
          </Button>
        </View>
      </View>
    )
  },
)

const Index = observer(function Index() {
  const { orders, error, changes } = useOrders()
  const { syncOrders } = useSync()

  const isReady = use$(() => syncState$.lastSyncAt.get() > 0)
  const isSyncing = use$(() => syncState$.syncStartedAt.get() > 0)

  return (
    <View className="flex-1 bg-background pt-10">
      <View className="border-b border-border px-4 pb-4">
        <Text className="my-4 text-2xl font-bold text-foreground">Orders</Text>
        <View className="flex-row items-center justify-between gap-2">
          <Button variant="outline" onPress={() => syncOrders()}>
            <Text>{isSyncing ? 'Syncing...' : 'Sync'}</Text>
          </Button>
          {changes.length > 0 && (
            <View className="ml-auto flex-row items-center gap-4">
              <Text>{changes.length} changes pending</Text>
              <Button
                variant="secondary"
                onPress={() => {
                  // TODO: Sync changes
                }}>
                <Text>Save</Text>
              </Button>
            </View>
          )}

          {/* <View className="flex-row items-center gap-2">
            <Text className="text-sm text-muted-foreground">Offline</Text>
            <Switch
              value={apiState$.offline.get()}
              onValueChange={(value) => apiState$.offline.set(value)}
            />
          </View> */}
        </View>
      </View>
      {!isReady && <ActivityIndicator color="white" />}
      <LegendList
        data={orders}
        refreshing={isSyncing}
        estimatedItemSize={150}
        recycleItems={true}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <OrderCard item={item} className={cn(index === 0 && 'mt-4')} />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">No orders found.</Text>
          </View>
        )}
      />
      {error && <Text className="text-red-500">{error.message}</Text>}
    </View>
  )
})

export default Index
