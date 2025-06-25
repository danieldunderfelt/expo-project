import { env } from '~/env'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

export const expoSqLite = openDatabaseSync(
  `more_local_${env.EXPO_PUBLIC_DB_VERSION}.db`,
  { enableChangeListener: true },
)

export const db = drizzle(expoSqLite)
