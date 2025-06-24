import { LegendList } from '@legendapp/list'
import { syncState, type ObservableObject } from '@legendapp/state'
import { observer, use$ } from '@legendapp/state/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { orders$ } from '~/data/orders/orders'
import type { Order } from '~/lib/api'
import { ActivityIndicator, View } from 'react-native'

const OrderCard = observer(({ item }: { item: ObservableObject<Order> }) => {
  // By getting the item, this component will re-render when any of its fields change.
  const order = use$(item)

  // This can happen if the item is deleted while the component is still mounted
  if (!order) {
    return null
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    // Ensure quantity is at least 1
    const quantity = Math.max(1, Number.isNaN(newQuantity) ? 1 : newQuantity)
    // This automatically triggers the 'update' in syncedCrud
    item.quantity.set(quantity)
  }

  const handleIncrement = () => {
    handleUpdateQuantity(order.quantity + 1)
  }

  const handleDecrement = () => {
    handleUpdateQuantity(order.quantity - 1)
  }

  return (
    <View className="mb-4 rounded-lg border border-border bg-card p-4">
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
          value={String(order.quantity)}
          onChangeText={(text) => handleUpdateQuantity(Number(text))}
        />
        <Button variant="outline" size="icon" onPress={handleIncrement}>
          <Text className="text-xl text-foreground">+</Text>
        </Button>
      </View>
    </View>
  )
})

const Index = observer(function Index() {
  const orderState = syncState(orders$)
  const orders = use$(() => orders$.get().filter((item) => !item.deleted_at))

  const isLoading = use$(orderState.isGetting)

  return (
    <View className="flex-1 bg-background p-4 pt-8">
      <Text className="mb-4 text-2xl font-bold text-foreground">Orders</Text>
      {!orderState.isLoaded && <ActivityIndicator color="white" />}
      <LegendList
        className="flex-1"
        data={orders}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() => orderState.sync()}
        renderItem={({ item }) => {
          const observableOrder = orders$.find(
            (order) => order.id.get() === item.id,
          )

          if (!observableOrder) {
            return null
          }

          return <OrderCard item={observableOrder} />
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">No orders found.</Text>
          </View>
        )}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
})

export default Index
