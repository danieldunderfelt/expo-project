import { Text } from '~/components/ui/text'
import { cn } from '~/lib/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextInputProps,
  type ViewProps,
} from 'react-native'

export interface OTPInputProps
  extends Omit<TextInputProps, 'value' | 'onChange' | 'maxLength'> {
  children?: React.ReactNode
  containerClassName?: string
  maxLength: number
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  pattern?: string | RegExp
  textAlign?: 'left' | 'center' | 'right'
  value?: string
  ref?: React.Ref<TextInput>
}

export function OTPInput({
  children,
  containerClassName,
  defaultValue = '',
  inputMode = 'numeric',
  maxLength,
  onChange,
  onComplete,
  pattern,
  placeholder,
  textAlign = 'left',
  value: controlledValue,
  ref,
  ...props
}: OTPInputProps) {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(
    typeof defaultValue === 'string' ? defaultValue : '',
  )

  // Determine if controlled or uncontrolled
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const previousValue = useRef(value)

  // Refs
  const inputRef = useRef<TextInput>(null)

  if (ref) {
    if (typeof ref === 'function') {
      ref(inputRef.current)
    } else if (typeof ref === 'object' && ref !== null) {
      ref.current = inputRef.current
    }
  }

  // Create regex pattern
  const regexp = useMemo(() => {
    if (!pattern) {
      return null
    }
    return typeof pattern === 'string' ? new RegExp(pattern) : pattern
  }, [pattern])

  // Handle value changes
  const handleChange = useCallback(
    (newValue: string) => {
      const trimmedValue = newValue.slice(0, maxLength)

      // Validate against pattern if provided
      if (trimmedValue.length > 0 && regexp && !regexp.test(trimmedValue)) {
        return
      }

      if (isControlled) {
        onChange?.(trimmedValue)
      } else {
        setInternalValue(trimmedValue)
        onChange?.(trimmedValue)
      }
    },
    [isControlled, maxLength, onChange, regexp],
  )

  // Handle completion
  useEffect(() => {
    if (
      previousValue.current !== value &&
      previousValue.current.length < maxLength &&
      value.length === maxLength
    ) {
      onComplete?.(value)
    }
    previousValue.current = value
  }, [value, maxLength, onComplete])

  // Focus handler
  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      props.onFocus?.(event)
    },
    [value.length, maxLength, props],
  )

  // Blur handler
  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      props.onBlur?.(event)
    },
    [props],
  )

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <View className={cn('relative flex-row', containerClassName)}>
      <TextInput
        onPress={focusInput}
        autoComplete="one-time-code"
        className={cn(
          'text-lg/0 h-10 flex-1 border border-border px-3 py-2 text-center text-white',
        )}
        numberOfLines={1}
        inputMode={inputMode}
        maxLength={maxLength}
        onBlur={handleBlur}
        onChangeText={handleChange}
        onFocus={handleFocus}
        ref={inputRef}
        textContentType="oneTimeCode"
        value={value}
        {...props}
      />
    </View>
  )
}

// Individual slot component
export interface OTPInputSlotProps extends ViewProps {
  className?: string
  index: number
  ref?: React.Ref<View>
  slots: Array<{
    char: string | null
    hasFakeCaret: boolean
    isActive: boolean
    placeholderChar: string | null
  }>
}

export function OTPInputSlot({
  children,
  className,
  index,
  ref,
  slots,
  ...props
}: OTPInputSlotProps) {
  const slot = slots[index]

  if (!slot) {
    return null
  }

  return (
    <View
      className={cn(
        'relative flex h-12 w-12 items-center justify-center border border-gray-300 text-sm',
        slot.isActive && 'border-blue-500 ring-1 ring-blue-500',
        className,
      )}
      ref={ref}
      {...props}>
      {children || (
        <>
          {slot.char && (
            <Text className="text-center text-base font-medium text-foreground">
              {slot.char}
            </Text>
          )}
          {slot.hasFakeCaret && (
            <View className="absolute inset-0 flex items-center justify-center">
              <View className="h-4 w-0.5 animate-pulse bg-gray-900" />
            </View>
          )}
          {slot.placeholderChar && !slot.char && (
            <Text className="text-center text-base text-muted-foreground">
              {slot.placeholderChar}
            </Text>
          )}
        </>
      )}
    </View>
  )
}

// Group component for layout
export interface OTPInputGroupProps extends ViewProps {
  className?: string
  ref?: React.Ref<View>
}

export function OTPInputGroup({
  className,
  ref,
  ...props
}: OTPInputGroupProps) {
  return (
    <View
      className={cn('flex flex-row items-center gap-2', className)}
      ref={ref}
      {...props}
    />
  )
}

// Separator component
export interface OTPInputSeparatorProps extends ViewProps {
  className?: string
  ref?: React.Ref<View>
}

export function OTPInputSeparator({
  className,
  ref,
  ...props
}: OTPInputSeparatorProps) {
  return (
    <View
      className={cn('flex items-center justify-center', className)}
      ref={ref}
      {...props}
    />
  )
}
