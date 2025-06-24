import { Ionicons } from '@expo/vector-icons'
import { NAV_THEME } from '~/lib/constants.ts'
import { cn } from '~/lib/utils'
import type React from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { NumericFormat } from 'react-number-format'

interface InputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  ref?: React.RefObject<TextInput>
  showClearButton?: boolean
  type?: 'text' | 'numeric'
  formatted?: boolean
  value?: string | number
  onChangeText?: (text: string) => void
  // Numeric format props
  thousandSeparator?: boolean | string
  decimalSeparator?: string
  decimalScale?: number
  fixedDecimalScale?: boolean
  allowNegative?: boolean
  prefix?: string
  suffix?: string
}

function Input({
  className,
  placeholderClassName,
  showClearButton = false,
  type = 'text',
  formatted = true,
  value,
  onChangeText,
  thousandSeparator,
  decimalSeparator,
  decimalScale,
  fixedDecimalScale,
  allowNegative,
  prefix,
  suffix,
  ...props
}: InputProps) {
  const baseClassName = cn(
    'native:h-12 native:text-lg native:leading-[1.25] h-10 rounded-md border border-input bg-background px-3 text-base text-foreground file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground web:flex web:w-full web:py-2 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 lg:text-sm',
    props.editable === false && 'opacity-50 web:cursor-not-allowed',
    showClearButton && 'pr-10',
    className,
  )

  const placeholderClass = cn('text-muted-foreground', placeholderClassName)

  const hasValue =
    value !== undefined && value !== null && String(value).length > 0
  const canClear = showClearButton && hasValue && props.editable !== false

  const handleClear = () => {
    onChangeText?.('')
  }

  const renderClearButton = () => {
    if (!showClearButton) return null

    return (
      <Pressable
        onPress={handleClear}
        disabled={!canClear}
        className={cn(
          'absolute right-2 top-1/2 size-4 -translate-y-1/2 items-center justify-center',
          canClear ? 'opacity-70' : 'opacity-30',
        )}>
        <Ionicons
          name="close"
          size={16}
          color={canClear ? NAV_THEME.dark.text : '#d1d5db'}
        />
      </Pressable>
    )
  }

  // If numeric type with formatting enabled, use NumericFormat
  if (type === 'numeric' && formatted) {
    return (
      <View className="relative">
        <NumericFormat
          customInput={TextInput}
          value={value}
          onValueChange={(values) => {
            onChangeText?.(values.value)
          }}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={allowNegative}
          prefix={prefix}
          suffix={suffix}
          className={baseClassName}
          placeholderClassName={placeholderClass}
          placeholder={props.placeholder}
          editable={props.editable}
          autoFocus={props.autoFocus}
          keyboardType={props.keyboardType}
        />
        {renderClearButton()}
      </View>
    )
  }

  // Default TextInput for text type or numeric without formatting
  return (
    <View className="relative">
      <TextInput
        className={baseClassName}
        placeholderClassName={placeholderClass}
        value={typeof value === 'number' ? value.toString() : value}
        onChangeText={onChangeText}
        keyboardType={type === 'numeric' ? 'numeric' : 'default'}
        {...props}
      />
      {renderClearButton()}
    </View>
  )
}

export { Input }
