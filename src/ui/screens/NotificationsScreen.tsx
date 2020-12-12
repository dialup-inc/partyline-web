import * as React from 'react'
import { Center, Text } from '@chakra-ui/core'

import Screen from './Screen'
import { FormScreenContentBox, FormScreenNextButton } from './FormScreen'

export type NotificationsScreenProps = {
  isRegisteringNotifications: boolean
  onNotify: () => void
  onDone: () => void
}

export default function NotificationsScreen({
  isRegisteringNotifications,
  onNotify,
  onDone,
}: NotificationsScreenProps) {
  return (
    <Screen>
      <FormScreenContentBox justifyContent="flex-start">
        <Center flex="1" flexDir="column">
          <Text fontSize="sm" fontWeight="bold" textAlign="center" mb={4}>
            Want to know when there are
            <br />
            more available matches for you?
          </Text>
          <Text fontSize="xs" textAlign="center">
            We can send you a push notification.
          </Text>
        </Center>
      </FormScreenContentBox>
      <FormScreenNextButton
        height={32}
        actionText="Notify me"
        actionProps={{
          size: 'lg-light',
        }}
        isWorking={isRegisteringNotifications}
        onAction={onNotify}
        secondaryActionText="Skip for now"
        onSecondaryAction={onDone}
      />
    </Screen>
  )
}
