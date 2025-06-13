import designTokens from '~/lib/designTokens.ts'
import { cn } from '~/lib/utils'
import { MotiView } from 'moti'
import type React from 'react'
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import {
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import ReanimatedCarousel, {
  Pagination,
  type ICarouselInstance,
} from 'react-native-reanimated-carousel'

interface CarouselProps<T> {
  items: T[]
  renderItem: ({
    item,
    index,
  }: {
    item: T
    index: number
  }) => React.ReactElement
  className?: string
  loop?: boolean
  width: number
  height?: number
  autoPlay?: boolean
  autoPlayInterval?: number
  showPagination?: boolean
  ListEmptyComponent?: React.ReactElement
}

interface CarouselContextProps {
  scrollNext: () => void
  scrollPrev: () => void
  scrollTo: (index: number) => void
  carouselRef: React.RefObject<ICarouselInstance>
  progress: SharedValue<number>
}

const CarouselContext = createContext<CarouselContextProps | null>(null)

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a CarouselProvider')
  }
  return context
}

const Carousel = forwardRef<ICarouselInstance, CarouselProps<any>>(
  (
    {
      items,
      renderItem,
      className,
      loop = true,
      width,
      height,
      autoPlay = false,
      autoPlayInterval,
      showPagination = true,
      ListEmptyComponent,
      ...props
    },
    ref,
  ) => {
    const carouselRef = useRef<ICarouselInstance>(null)
    const progress = useSharedValue(0)
    useImperativeHandle(ref, () => carouselRef.current as ICarouselInstance)

    const scrollNext = useCallback(() => {
      carouselRef.current?.next()
    }, [])

    const scrollPrev = useCallback(() => {
      carouselRef.current?.prev()
    }, [])

    const scrollTo = useCallback((index: number) => {
      carouselRef.current?.scrollTo({ index, animated: true })
    }, [])

    const onProgressChange = useCallback(
      (_: number, absoluteProgress: number) => {
        progress.value = withTiming(absoluteProgress)
      },
      [progress],
    )

    const contextValue = useMemo(
      () => ({
        scrollNext,
        scrollPrev,
        scrollTo,
        carouselRef: carouselRef as React.RefObject<ICarouselInstance>,
        progress,
      }),
      [scrollNext, scrollPrev, scrollTo, progress],
    )

    const [containerHeight, setContainerHeight] = useState<number | undefined>(
      height ?? undefined,
    )

    if (!items || items.length === 0) {
      return ListEmptyComponent ? <>{ListEmptyComponent}</> : null
    }

    return (
      <CarouselContext.Provider value={contextValue}>
        <View
          className={cn('relative w-full', className)}
          onLayout={(e) => {
            setContainerHeight(e.nativeEvent.layout.height)
          }}>
          <ReanimatedCarousel
            ref={carouselRef}
            data={items}
            renderItem={renderItem}
            loop={loop}
            width={width}
            snapEnabled={true}
            pagingEnabled={true}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            height={height ?? containerHeight}
            autoPlay={autoPlay}
            autoPlayInterval={autoPlayInterval}
            onProgressChange={onProgressChange}
            {...props}
          />
          {showPagination && items.length > 1 && (
            <CarouselPagination items={items} style={{ bottom: 16 }} />
          )}
        </View>
      </CarouselContext.Provider>
    )
  },
)

Carousel.displayName = 'Carousel'

export default Carousel

function CarouselPagination({
  items,
  style,
}: {
  items: unknown[]
  style?: StyleProp<ViewStyle>
}) {
  const { carouselRef, progress } = useCarousel()

  const onPressPagination = useCallback(
    (index: number) => {
      const current = carouselRef.current?.getCurrentIndex() ?? 0
      carouselRef.current?.scrollTo({
        count: index - current,
        animated: true,
      })
    },
    [carouselRef],
  )

  return (
    <Pagination.Basic
      progress={progress}
      data={[]}
      dotStyle={{
        backgroundColor: designTokens.accent,
        borderRadius: 50,
      }}
      activeDotStyle={{ backgroundColor: designTokens.primary }}
      containerStyle={[
        {
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          gap: 10,
          justifyContent: 'center',
        },
        style,
      ]}
      onPress={onPressPagination}
    />
  )
}
CarouselPagination.displayName = 'CarouselPagination'

const CarouselButton = forwardRef<
  React.ElementRef<typeof MotiView>,
  {
    className?: string
    onPress?: () => void
    children: React.ReactNode
    side: 'left' | 'right'
  }
>(({ className, onPress, children, side }, ref) => {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'absolute top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-background/50 p-2',
        side === 'left' ? 'left-2' : 'right-2',
        className,
      )}>
      <MotiView
        ref={ref as any}
        {...(Platform.OS !== 'web' && {
          style: {
            transform: [{ translateY: -12 }],
          },
        })}>
        {children}
      </MotiView>
    </Pressable>
  )
})

CarouselButton.displayName = 'CarouselButton'

export const CarouselNext = forwardRef<
  React.ElementRef<typeof MotiView>,
  Omit<React.ComponentPropsWithoutRef<typeof CarouselButton>, 'side'>
>(({ ...props }, ref) => {
  const { scrollNext } = useCarousel()
  return (
    <CarouselButton ref={ref} side="right" onPress={scrollNext} {...props} />
  )
})

CarouselNext.displayName = 'CarouselNext'

export const CarouselPrevious = forwardRef<
  React.ElementRef<typeof MotiView>,
  Omit<React.ComponentPropsWithoutRef<typeof CarouselButton>, 'side'>
>(({ ...props }, ref) => {
  const { scrollPrev } = useCarousel()
  return (
    <CarouselButton ref={ref} side="left" onPress={scrollPrev} {...props} />
  )
})

CarouselPrevious.displayName = 'CarouselPrevious'

export { Carousel, CarouselPagination, CarouselButton }
