import { LegendList } from '@legendapp/list'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Text } from '~/components/ui/text'
import { RefreshControl, View } from 'react-native'
import { z } from 'zod/v4'

const commentsSchema = z.object({
  id: z.number(),
  name: z.string(),
  body: z.string(),
})

export default function Index() {
  const users = useInfiniteQuery({
    queryKey: ['users'],
    queryFn: ({ pageParam = 1 }: { pageParam: number | undefined }) => {
      if (pageParam === undefined) {
        return []
      }

      return fetch('https://jsonplaceholder.typicode.com/comments')
        .then((res) => res.json())
        .then((data) => {
          const pageStart = (pageParam - 1) * 10
          const pageEnd = pageStart + 10
          return z.array(commentsSchema).parse(data).slice(pageStart, pageEnd)
        })
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length > 0 ? pages.length + 1 : undefined,
    initialPageParam: 1,
  })

  // biome-ignore lint/correctness/noFlatMapIdentity: <explanation>
  const allUsers = users.data?.pages?.flatMap((page) => page) ?? []

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-black">Users</Text>
      {users.error && (
        <Text className="text-red-500">{users.error.message}</Text>
      )}
      <LegendList
        refreshControl={
          <RefreshControl
            refreshing={users.isFetching}
            onRefresh={() =>
              users.hasNextPage ? users.fetchNextPage() : users.refetch()
            }
          />
        }
        className="flex-1"
        data={allUsers}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => {
          if (users.hasNextPage) {
            users.fetchNextPage()
          }
        }}
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
