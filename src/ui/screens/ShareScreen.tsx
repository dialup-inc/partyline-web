import * as React from 'react'
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  VStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/core'

import { SHARE_INFO, SHARE_MSG } from '../../constants'
import Screen from './Screen'
import { FormScreenNextButton, FormScreenContentBox } from './FormScreen'
import { FacebookShareIcon, TwitterShareIcon, EmailShareIcon } from '../icons'

const FACEBOOK_SHARE_URL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
  SHARE_INFO.url,
)}&t=TITLE=${SHARE_MSG}`

const TWITTER_SHARE_URL = `https://twitter.com/intent/tweet?text=${SHARE_MSG}`

const EMAIL_SHARE_URL = `mailto:?to=&subject=${encodeURIComponent(
  SHARE_INFO.title,
)}&body=${encodeURIComponent(SHARE_MSG)}`

type ShareModalProps = {
  isOpen: boolean
  onClose: () => void
  onDone: () => void
}

function ShareModal({ isOpen, onClose, onDone }: ShareModalProps) {
  return (
    <Modal size="md" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay>
        <ModalContent>
          <ModalBody>
            <Center flexDir="column">
              <Heading size="md" textAlign="center" mb={4}>
                Choose a place to share a link.
              </Heading>
              <Text fontSize="xs" mb={8}>
                A friend or relative might enjoy trying PartyLine.
              </Text>
              <HStack flex="1" spacing={8}>
                <VStack as="label" spacing={4}>
                  <IconButton
                    bg="none"
                    icon={<FacebookShareIcon />}
                    boxSize="5rem"
                    fontSize="5rem"
                    aria-label="Share on Facebook"
                    onClick={() => window.open(FACEBOOK_SHARE_URL)}
                    isRound
                  />
                  <Text fontSize="xs">Facebook</Text>
                </VStack>
                <VStack as="label" spacing={4}>
                  <IconButton
                    bg="none"
                    icon={<TwitterShareIcon />}
                    boxSize="5rem"
                    fontSize="5rem"
                    aria-label="Share on Twitter"
                    onClick={() => window.open(TWITTER_SHARE_URL)}
                    isRound
                  />
                  <Text fontSize="xs">Twitter</Text>
                </VStack>
                <VStack as="label" spacing={4}>
                  <IconButton
                    bg="none"
                    icon={<EmailShareIcon />}
                    boxSize="5rem"
                    fontSize="5rem"
                    aria-label="Share via email"
                    onClick={() => window.open(EMAIL_SHARE_URL)}
                    isRound
                  />
                  <Text fontSize="xs">Email</Text>
                </VStack>
              </HStack>
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button flex="1" size="sm" variant="outline" onClick={onDone}>
              Done sharing
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}

export type ShareScreenProps = {
  isModalOpen?: boolean
  onShareInitiated?: () => void
  onDone: () => void
}

export default function ShareScreen({
  isModalOpen: isModalOpenProp,
  onShareInitiated,
  onDone,
}: ShareScreenProps) {
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure({ isOpen: isModalOpenProp })

  async function share() {
    onShareInitiated()

    if (!navigator.share) {
      onModalOpen()
      return
    }

    try {
      await navigator.share(SHARE_INFO)
    } catch (err) {
      // User cancelled share
    } finally {
      onDone()
    }
  }

  return (
    <Screen>
      <ShareModal isOpen={isModalOpen} onClose={onModalClose} onDone={onDone} />
      <FormScreenContentBox justifyContent="flex-start">
        <Center flex="1" flexDir="column">
          <Text fontSize="xs" textAlign="center" mb={4}>
            Sent. Thank you for sharing!
          </Text>
          <Text fontSize="sm" fontWeight="bold" textAlign="center">
            PartyLine is better with more voices! Invite your relatives you
            disagree with.
          </Text>
        </Center>
      </FormScreenContentBox>
      <FormScreenNextButton
        height={32}
        actionText="Tell someone to try it"
        actionProps={{ size: 'lg-light' }}
        onAction={share}
        secondaryActionText="Maybe later"
        onSecondaryAction={onDone}
      />
    </Screen>
  )
}
