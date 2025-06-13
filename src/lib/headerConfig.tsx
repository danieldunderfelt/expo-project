import Ionicons from '@expo/vector-icons/Ionicons'
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useRouter } from 'expo-router'
import { Pressable, View } from 'react-native'
import { NAV_THEME } from './constants'

export const HeaderBackButton = ({
  canGoBack,
  onPress,
}: {
  canGoBack: boolean
  onPress?: () => void
}) => {
  const router = useRouter()

  return (
    <View className="ml-4 flex flex-row items-center gap-1.5">
      <Pressable
        className="size-8 items-center justify-center"
        onPress={() => {
          onPress?.()

          if (canGoBack) {
            router.back()
          } else {
            router.navigate('/')
          }
        }}>
        <Ionicons name="arrow-back" size={16} color={NAV_THEME.dark.text} />
      </Pressable>
    </View>
  )
}

export const getGlobalHeaderOptions = () =>
  ({
    headerStyle: {
      backgroundColor: NAV_THEME.dark.background, // Use theme background
    },
    headerTintColor: NAV_THEME.dark.text, // Use theme text color
    headerTitleStyle: {
      fontWeight: 'thin' as const,
      fontSize: 20,
    },
    headerBackVisible: false,
    headerShown: false,
    headerLeft: ({ canGoBack }) => (
      <HeaderBackButton canGoBack={canGoBack || false} />
    ),
  }) satisfies NativeStackNavigationOptions

export const getRouteWithHeaderOptions = () => ({
  ...getGlobalHeaderOptions(),
  headerShown: true,
})
