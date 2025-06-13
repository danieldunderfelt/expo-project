import Ionicons from '@expo/vector-icons/Ionicons'
import { cn } from '~/lib/utils.ts'
import {
  ImageErrorEventData,
  Image as RNImage,
  type ImageProps,
} from 'expo-image'
import { useState } from 'react'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Text } from './ui/text'

export default function Image({
  source,
  className,
  imageClassName,
  errorClassName,
  onPress,
  buttonLabel,
  ...imageProps
}: {
  className?: string
  imageClassName?: string
  errorClassName?: string
  onPress?: () => void
  buttonLabel?: string
} & ImageProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <View className={cn('flex-row gap-2', className)}>
      {!imageError ? (
        <RNImage
          source={source}
          className={cn('aspect-video w-full', imageClassName)}
          contentFit="cover"
          {...imageProps}
          onError={(event: ImageErrorEventData) => {
            setImageError(true)
            imageProps.onError?.(event)
          }}
        />
      ) : (
        <View className={cn('w-full px-4 pt-4', errorClassName)}>
          <View className="flex-1 items-center justify-center gap-2 rounded-md border border-muted bg-muted/50 p-4 pb-2">
            <Ionicons
              name="cloud-offline"
              size={24}
              className="text-muted-foreground"
            />
            <Text className="text-center text-sm text-muted-foreground">
              Kuvaa ei voitu ladata.
            </Text>
            {buttonLabel && onPress && (
              <Button
                variant="link"
                size="sm"
                className="pb-0 text-xs text-foreground underline"
                onPress={onPress}>
                {buttonLabel}
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  )
}
