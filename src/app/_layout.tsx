import NetInfo from '@react-native-community/netinfo'
import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native'
import { PortalHost } from '@rn-primitives/portal'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colorScheme } from 'nativewind'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AppState, Platform, View, type AppStateStatus } from 'react-native'
import '~/global.css'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AlertProvider } from '~/components/GlobalAlert.tsx'
import { db, expoSqLite } from '~/data/db/setup.ts'
import { SyncProvider } from '~/data/sync.tsx'
import { NAV_THEME } from '~/lib/constants'
import { getGlobalHeaderOptions } from '~/lib/headerConfig'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import migrations from '../../drizzle/migrations'

export const unstable_settings = {
  initialRouteName: 'index',
}

/* const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
} */

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

const queryClient = new QueryClient()

if (Platform.OS !== 'web') {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected)
    }),
  )
}

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

export default function RootLayout() {
  useDrizzleStudio(expoSqLite)
  const { success: migrationsSuccess, error: migrationsError } = useMigrations(
    db,
    migrations,
  )

  if (migrationsError) {
    console.error(migrationsError)
  }

  if (!migrationsSuccess) {
    console.log('Migrations in progress')
  } else {
    console.log('Migrations successful')
  }

  const hasMounted = useRef(false)
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return
    }

    colorScheme.set('dark')

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background')
    }

    setIsColorSchemeLoaded(true)
    hasMounted.current = true
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const subscription = AppState.addEventListener('change', onAppStateChange)
      return () => subscription.remove()
    }
  }, [])

  if (!isColorSchemeLoaded || !migrationsSuccess) {
    return null
  }

  return (
    <GestureHandlerRootView className="w-full flex-1 flex-col bg-background">
      <QueryClientProvider client={queryClient}>
        <SyncProvider>
          <ThemeProvider value={DARK_THEME}>
            <SafeAreaProvider>
              <AlertProvider>
                <BottomSheetModalProvider>
                  <StatusBar style={'light'} />
                  <View className="w-full flex-1 web:mx-auto web:max-w-screen-md web:border-border web:md:border-x">
                    <Stack screenOptions={getGlobalHeaderOptions()} />
                  </View>
                </BottomSheetModalProvider>
                <PortalHost />
              </AlertProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </SyncProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined'
    ? useEffect
    : useLayoutEffect
