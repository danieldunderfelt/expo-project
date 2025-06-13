import { Text as Slot_Text } from '@rn-primitives/slot'
import { cn } from '~/lib/utils'
import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Text as RNText } from 'react-native'

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<typeof RNText> & {
  asChild?: boolean
  ref?: React.RefObject<RNText>
}) {
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot_Text : RNText

  return (
    <Component
      className={cn(
        'text-base text-foreground web:select-text',
        textClass,
        className,
      )}
      {...props}
    />
  )
}

export { Text, TextClassContext }
