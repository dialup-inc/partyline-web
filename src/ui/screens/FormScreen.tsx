import * as React from 'react'
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Button,
  VStack,
} from '@chakra-ui/core'
import {
  Field,
  useFormikContext,
  useField,
  FieldInputProps,
  FieldHelperProps,
} from 'formik'

export type FormScreenNextButtonProps = {
  actionText?: string
  isWorking?: boolean
  isDisabled?: boolean
  actionProps?: React.ComponentProps<typeof Button>
  onAction?: () => void
  secondaryActionText?: string
  onSecondaryAction?: () => void
  noteText?: string
  height?: React.ComponentProps<typeof Box>['height']
}

export function FormScreenNextButton({
  actionText = 'Next',
  isWorking,
  isDisabled,
  actionProps,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  noteText,
  height = 40,
}: FormScreenNextButtonProps) {
  return (
    <Flex direction="column" mx={4} height={height} alignItems="center">
      <Button
        type="submit"
        size="lg"
        isLoading={isWorking}
        isDisabled={isDisabled}
        onClick={onAction}
        {...actionProps}
      >
        {actionText}
      </Button>
      {noteText && (
        <Text fontSize="xs" mt={4} textAlign="center">
          {noteText}
        </Text>
      )}
      {onSecondaryAction && (
        <Button variant="link" mt={4} onClick={onSecondaryAction}>
          {secondaryActionText}
        </Button>
      )}
    </Flex>
  )
}

export function FormikNextButton(props: FormScreenNextButtonProps) {
  const formikContext = useFormikContext()
  // Work around https://github.com/formium/formik/issues/2172
  const isTouched = Object.values(formikContext.touched).length > 0
  return (
    <FormScreenNextButton
      isDisabled={!isTouched || !formikContext.isValid}
      {...props}
    />
  )
}

export type FormScreenTitleProps = {
  title: string
  subtitle?: string
}

export function FormScreenTitle({ title, subtitle }: FormScreenTitleProps) {
  return (
    <Flex direction="column" alignItems="center" textAlign="center" height={12}>
      <Text fontSize={['sm', 'lg']} mb={2}>
        {title}
      </Text>
      {subtitle && <Text fontSize="xs">{subtitle}</Text>}
    </Flex>
  )
}

export type FormScreenContentBoxProps = React.ComponentProps<typeof Box> & {
  children: React.ReactNode
}

export function FormScreenContentBox({
  children,
  ...props
}: FormScreenContentBoxProps) {
  return (
    <VStack
      w="100%"
      maxW={['24rem', '28rem']}
      minH="14rem"
      mx="auto"
      px={4}
      spacing={2}
      my={[4, 8]}
      direction="column"
      alignContent="center"
      justifyContent="space-evenly"
      {...props}
    >
      {children}
    </VStack>
  )
}

export type StaticHeightErrorMessageProps = {
  children?: React.ReactNode
}

export function StaticHeightErrorMessage({
  children,
}: StaticHeightErrorMessageProps) {
  return (
    <Box h={6} mt={2}>
      <FormErrorMessage m={0}>{children}</FormErrorMessage>
    </Box>
  )
}

export type FormFieldProps<T> = {
  name: string
  label?: string
  hasNoErrors?: boolean
  validate?: (value: any) => string
  children: (
    field: FieldInputProps<T>,
    helpers: FieldHelperProps<T>,
  ) => React.ReactNode
}

export function FormField({
  label,
  hasNoErrors,
  children,
  ...props
}: FormFieldProps<any>) {
  const [field, meta, helpers] = useField(props)
  return (
    <FormControl isInvalid={meta.error && meta.touched}>
      {label && <FormLabel>{label}</FormLabel>}
      {children(field, helpers)}
      {!hasNoErrors && (
        <StaticHeightErrorMessage>{meta.error}</StaticHeightErrorMessage>
      )}
    </FormControl>
  )
}
