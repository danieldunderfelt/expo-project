import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'EXPO_PUBLIC_',
  client: {
    EXPO_PUBLIC_DB_VERSION: z.string().default('1'),
  },
  runtimeEnvStrict: {
    EXPO_PUBLIC_DB_VERSION: process.env.EXPO_PUBLIC_DB_VERSION,
  },
  emptyStringAsUndefined: true,
})
