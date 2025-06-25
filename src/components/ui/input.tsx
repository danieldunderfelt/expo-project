import { Ionicons } from '@expo/vector-icons'
import { Text } from '~/components/ui/text'
import { NAV_THEME } from '~/lib/constants.ts'
import { cn } from '~/lib/utils'
import type React from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'

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

  if (type === 'numeric' && formatted) {
    const formatNumber = (val: string | number | undefined): string => {
      if (val === undefined || val === null || val === '') return ''
      const numericValue =
        typeof val === 'number'
          ? val
          : Number.parseFloat(String(val).replace(/,/g, '.'))
      if (Number.isNaN(numericValue)) return String(val)

      const options: Intl.NumberFormatOptions = {
        useGrouping: !!thousandSeparator,
        style: 'decimal',
      }
      if (decimalScale !== undefined) {
        options.maximumFractionDigits = decimalScale
        if (fixedDecimalScale) {
          options.minimumFractionDigits = decimalScale
        }
      }
      return new Intl.NumberFormat('fi-FI', options).format(numericValue)
    }

    const handleNumericChange = (text: string) => {
      if (!onChangeText) return
      const rawValue = text.replace(/[^0-9,.-]/g, '')
      const normalized = rawValue.replace(/,/g, '.')
      onChangeText(normalized)
    }

    const textStyle = 'py-2 text-foreground font-semibold text-lg'

    return (
      <View className="relative">
        {prefix ? <Text className={textStyle}>{prefix}</Text> : null}
        <TextInput
          className={cn(baseClassName)}
          placeholderClassName={placeholderClass}
          value={formatNumber(value)}
          onChangeText={handleNumericChange}
          keyboardType="numeric"
          selectTextOnFocus
          {...props}
        />
        {suffix ? <Text className={textStyle}>{suffix}</Text> : null}
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
