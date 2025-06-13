import Ionicons from '@expo/vector-icons/Ionicons'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        )
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error
  resetError: () => void
}) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center p-4">
      <View className="max-w-sm items-center space-y-4">
        <Ionicons name="alert-circle" size={48} className="text-destructive" />

        <Text className="text-center text-xl font-semibold">
          Something went wrong
        </Text>

        <Text className="text-center text-muted-foreground">
          An unexpected error occurred. Please try again.
        </Text>

        {__DEV__ && error && (
          <View className="mt-4 rounded-lg bg-secondary p-3">
            <Text className="text-xs text-muted-foreground">
              {error.message}
            </Text>
          </View>
        )}

        <Button onPress={resetError} className="mt-4">
          <Text>Try Again</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
