import { LegendList } from '@legendapp/list'
import { observer, use$ } from '@legendapp/state/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import type { Order, OrderChange } from '~/data/db/schema'
import { useOrders } from '~/data/models/orders.ts'
import { syncState$, useSync } from '~/data/sync.tsx'
import type { InsertOrderChange } from '~/data/types.ts'
import { memo, startTransition, useCallback, useOptimistic } from 'react'
import { ActivityIndicator, View } from 'react-native'

const OrderCard = memo(
  ({
    item,
    addChange,
  }: {
    item: Order
    addChange: (change: InsertOrderChange) => Promise<OrderChange>
  }) => {
    const [quantity, setOptimisticQuantity] = useOptimistic(
      item.quantity,
      (_, newQuantity: number) => newQuantity,
    )

    // By getting the item, this component will re-render when any of its fields change.
    const order = item

    // This can happen if the item is deleted while the component is still mounted
    if (!order) {
      return null
    }

    const handleUpdateQuantity = useCallback(
      async (newQuantity: number) => {
        const quantity = Math.max(
          1,
          Number.isNaN(newQuantity) ? 1 : newQuantity,
        )

        startTransition(async () => {
          setOptimisticQuantity(quantity)

          await addChange({
            changeKey: 'quantity',
            changeValue: String(quantity),
            orderId: order.id,
          })
        })
      },
      [addChange, order.id, setOptimisticQuantity],
    )

    const handleIncrement = () => {
      handleUpdateQuantity(quantity + 1)
    }

    const handleDecrement = () => {
      handleUpdateQuantity(quantity - 1)
    }

    return (
      <View className="mx-4 mb-4 rounded-lg border border-border bg-card p-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-card-foreground">
            {order.name}
          </Text>
          <Text className="mb-4 text-sm text-muted-foreground">
            ID: {order.id}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onPress={handleDecrement}
            disabled={order.quantity <= 1}>
            <Text className="text-xl text-foreground">-</Text>
          </Button>
          <Input
            className="flex-1 text-center text-lg text-card-foreground"
            keyboardType="number-pad"
            value={String(quantity)}
            onChangeText={(text) =>
              handleUpdateQuantity(Number.parseInt(text, 10))
            }
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
  const { syncOrders } = useSync()
  const isReady = use$(() => syncState$.lastSyncAt.get() > 0)
  const isSyncing = use$(() => syncState$.syncStartedAt.get() > 0)
  const { orders, error, addChange } = useOrders()

  console.log('ordersData', orders?.length)

  return (
    <View className="flex-1 bg-background pt-10">
      <View className="px-4">
        <Text className="my-4 text-2xl font-bold text-foreground">Orders</Text>
        <View className="mb-4 flex-row items-center justify-between gap-2">
          <Button variant="outline" onPress={() => syncOrders()}>
            <Text>Sync</Text>
          </Button>

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
        className="flex-1"
        contentContainerClassName="px-4"
        data={orders}
        refreshing={isSyncing}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard item={item} addChange={addChange} />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">No orders found.</Text>
          </View>
        )}
        onEndReachedThreshold={0.5}
      />
      {error && <Text className="text-red-500">{error.message}</Text>}
    </View>
  )
})

export default Index
