import { Text } from '~/components/ui/text'
import { Link, Stack } from 'expo-router'
import { View } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-lg font-bold">
          This screen doesn&apos;t exist.
        </Text>
        <Link className="mt-4 pt-4" href="/">
          <Text className="text-base text-[#2e78b7]">Go to home screen!</Text>
        </Link>
      </View>
    </>
  )
}
