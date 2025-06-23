import { LegendList } from '@legendapp/list'
import { Text } from '~/components/ui/text'
import { View } from 'react-native'

export default function Index() {
  const allUsers: { id: number; name: string; body: string }[] = []

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-black">Users</Text>
      <LegendList
        className="flex-1"
        data={allUsers}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View className="w-full flex-1 items-center justify-center p-4">
            <Text className="text-black">{item.id}</Text>
            <Text className="text-black">{item.name}</Text>
            <Text className="text-black">{item.body}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-black">Loading...</Text>
          </View>
        )}
      />
    </View>
  )
}
