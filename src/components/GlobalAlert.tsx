import { Button } from '~/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog.tsx'
import { Text } from '~/components/ui/text'
import { createContext, useContext, useState } from 'react'
import { View } from 'react-native'

export type AlertContextType = {
  showAlert: (alert: Alert) => void
  closeAlert: () => void
}

export type AlertAction = {
  label: string
  onPress: (args: AlertContextType) => Promise<unknown> | unknown
  buttonClassName?: string
  shouldClose?: boolean
}

export type AlertType = 'info' | 'error' | 'success' | 'confirm'

export type Alert = {
  type: AlertType
  title: string
  description: string
  actions?: AlertAction[]
  cancelButton?: boolean | AlertAction
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {
    throw new Error('AlertProvider not found')
  },
  closeAlert: () => {},
})

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alert, setAlert] = useState<Alert | null>(null)

  const showAlert = (alert: Alert) => {
    setAlert(alert)
  }

  const closeAlert = () => {
    setAlert(null)
  }

  const cancelProps =
    typeof alert?.cancelButton === 'object'
      ? alert.cancelButton
      : alert?.cancelButton !== false
        ? {
            label: 'Peruuta',
            onPress: () => closeAlert(),
          }
        : undefined

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {!!alert && (
        <View className="flex-1 items-center justify-center">
          <Dialog open={!!alert} onOpenChange={closeAlert}>
            <DialogContent
              className="w-full min-w-80 max-w-lg gap-6"
              showCloseButton={false}>
              <DialogHeader className="gap-2">
                <DialogTitle>{alert.title}</DialogTitle>
                <DialogDescription>{alert.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-row justify-end gap-2">
                {alert.actions ? (
                  <>
                    {cancelProps && (
                      <Button
                        variant="outline"
                        className={cancelProps.buttonClassName}
                        onPress={() =>
                          cancelProps.onPress?.({ showAlert, closeAlert })
                        }>
                        <Text>{cancelProps.label}</Text>
                      </Button>
                    )}
                    {alert.actions.map((action) => (
                      <Button
                        key={action.label}
                        onPress={async () => {
                          await action.onPress({ showAlert, closeAlert })

                          if (action.shouldClose !== false) {
                            closeAlert()
                          }
                        }}
                        className={action.buttonClassName}>
                        <Text>{action.label}</Text>
                      </Button>
                    ))}
                  </>
                ) : (
                  <Button onPress={() => closeAlert()}>
                    <Text>OK</Text>
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </View>
      )}
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  return useContext(AlertContext)
}
