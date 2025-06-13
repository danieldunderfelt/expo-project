import { useTheme } from '@react-navigation/native'
import { cn } from '~/lib/utils.ts'
import { ActivityIndicator } from 'react-native'

export function LoadingView({ className }: { className?: string }) {
  const theme = useTheme()

  return (
    <ActivityIndicator
      size="large"
      className={cn('flex-1', className)}
      color={theme.colors.text}
    />
  )
}
