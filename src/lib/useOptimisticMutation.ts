import type { QueryKey } from '@tanstack/query-core'
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'

export type OptimisticUpdateFunction<TData, TVariables> = (
  oldData: TData | undefined,
  variables: TVariables,
) => TData

export interface UseOptimisticMutationOptions<
  TData,
  TVariables,
  TError,
  TQueryData = TData,
> extends UseMutationOptions<
    TData,
    TError,
    TVariables,
    { previousData: TQueryData | undefined } | undefined
  > {
  queryKey: QueryKey
  invalidateQueryKey?: QueryKey | QueryKey[]
  optimisticUpdate: OptimisticUpdateFunction<TQueryData, TVariables>
  invalidate?: boolean
}

function useOptimisticMutation<
  TData,
  TVariables,
  TError = unknown,
  TQueryData = TData,
>({
  queryKey,
  invalidateQueryKey,
  optimisticUpdate,
  mutationFn,
  invalidate = true,
  ...options
}: UseOptimisticMutationOptions<
  TData,
  TVariables,
  TError,
  TQueryData
>): UseMutationResult<
  TData,
  TError,
  TVariables,
  { previousData: TQueryData | undefined } | undefined
> {
  const queryClient = useQueryClient()

  return useMutation<
    TData,
    TError,
    TVariables,
    | {
        previousData: TQueryData | undefined
        optimisticUpdateResult: TQueryData | undefined
      }
    | undefined
  >({
    mutationFn,
    ...options,
    onMutate: async (variables) => {
      const onMutateResult = await options.onMutate?.(variables)

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TQueryData>(queryKey)

      // Optimistically update to the new value
      const nextQueryData = queryClient.setQueryData<TQueryData>(
        queryKey,
        (old) => optimisticUpdate(old, variables),
      )

      // Return a context object with the snapshotted value
      return {
        ...(onMutateResult as { previousData: TQueryData | undefined } & Record<
          string,
          unknown
        >),
        optimisticUpdateResult: nextQueryData,
        previousData: {
          ...onMutateResult?.previousData,
          ...previousData,
        } as TQueryData,
      }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      if (options.onError) {
        return options.onError(err, variables, context)
      }

      return err
    },
    onSuccess: (data, variables, context) => {
      if (invalidate && data) {
        const keysToInvalidate = invalidateQueryKey || queryKey
        const queryKeys = Array.isArray(keysToInvalidate)
          ? keysToInvalidate
          : [keysToInvalidate]

        for (const queryKeyItem of queryKeys) {
          queryClient.invalidateQueries({ queryKey: queryKeyItem as QueryKey })
        }
      }

      if (options.onSuccess) {
        return options.onSuccess(data, variables, context)
      }

      return data
    },
  })
}

export default useOptimisticMutation
