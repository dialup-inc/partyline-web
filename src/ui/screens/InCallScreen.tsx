import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import startCase from 'lodash/startCase'
import {
  Box,
  Center,
  HStack,
  Spacer,
  Button,
  IconButton,
  Flex,
  Text,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
} from '@chakra-ui/core'

import type { PartnerInfo, Prompt } from '../../types'
import states from '../../states.json'
import Screen from './Screen'
import { MicIcon, Spinner, NextIcon } from '../icons'
import Stream from '../component/Stream'
import TimerSince from '../component/TimerSince'
import CallPrompt from '../component/CallPrompt'
import Waveform from '../component/Waveform'

const QUESTION_CYCLE_INTERVAL = 20 * 1000

type EndCallModalProps = {
  isOpen: boolean
  onClose: () => void
  onEndCall: () => void
}

function EndCallModal({ isOpen, onClose, onEndCall }: EndCallModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay>
        <ModalContent>
          <ModalBody>
            <Heading size="md" textAlign="center">
              Are you sure you want to end this call?
            </Heading>
          </ModalBody>
          <ModalFooter>
            <HStack flex="1" spacing={2}>
              <Button flex="1" size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                flex="1"
                size="sm"
                colorScheme="brightRed"
                onClick={onEndCall}
              >
                End call
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}

type PartnerLeftModalProps = {
  isOpen: boolean
  onEndCall: () => void
}

function PartnerLeftModal({ isOpen, onEndCall }: PartnerLeftModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onEndCall}>
      <ModalOverlay>
        <ModalContent>
          <ModalBody>
            <Heading size="md" textAlign="center" mb="4">
              Your partner left.
            </Heading>
            <Text fontSize="xs">You can join the match pool again later.</Text>
          </ModalBody>
          <ModalFooter>
            <Button flex="1" size="sm" variant="outline" onClick={onEndCall}>
              Tell us about your call
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}

export type InCallScreenProps = {
  micStream: MediaStream
  remoteStream: MediaStream
  callStartTime: Date
  partner: PartnerInfo
  prompts: Array<Prompt>
  talkingCount: number
  answeringQuestionsCount: number
  isSilent?: boolean
  isConnected: boolean
  isRemoteEnded: boolean
  isEndCallOpen?: boolean
  questionCycleInterval?: number
  onEndCall: () => void
}

export default function InCallScreen({
  micStream,
  remoteStream,
  callStartTime,
  partner,
  prompts,
  talkingCount,
  answeringQuestionsCount,
  isSilent,
  isConnected,
  isRemoteEnded,
  isEndCallOpen: isEndCallOpenProp,
  questionCycleInterval = QUESTION_CYCLE_INTERVAL,
  onEndCall,
}: InCallScreenProps) {
  const {
    isOpen: isEndCallOpen,
    onOpen: onEndCallOpen,
    onClose: onEndCallClose,
  } = useDisclosure({ isOpen: isEndCallOpenProp })
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0)
  const [showMicStatus, setShowMicStatus] = useState(false)

  const handleNextPrompt = useCallback(() => {
    if (!prompts) {
      return
    }
    setCurrentPromptIdx((currentPromptIdx + 1) % prompts.length)
  }, [prompts, currentPromptIdx])

  useEffect(() => {
    const interval = setInterval(handleNextPrompt, questionCycleInterval)
    return () => clearInterval(interval)
  }, [handleNextPrompt])

  // Give a short grace period for mic to load before displaying status.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMicStatus(true)
    }, 250)
    return () => clearTimeout(timeout)
  }, [])

  const actionButton = (
    <Button
      colorScheme="brightRed"
      size="sm"
      w={32}
      onClick={partner ? onEndCallOpen : onEndCall}
    >
      {partner ? 'End call' : 'Leave pool'}
    </Button>
  )
  const bottomPane = (
    <Center
      flex={1}
      bg="darkBlue"
      w="100%"
      p={4}
      py={6}
      textAlign="center"
      flexDir="column"
    >
      <Box opacity={showMicStatus ? 1 : 0} transition="opacity 500ms ease-in">
        {!micStream && (
          <>
            <MicIcon color="brightRed" boxSize={8} />
            <Text color="lightBlue" fontSize={['xs', 'sm']} mt={4}>
              Enable microphone permissions so your partner can hear you.
            </Text>
          </>
        )}
        {micStream && (
          <>
            <Waveform colorScheme="blue" stream={micStream} m={2} />
            <Text color="lightBlue" fontSize={['xs', 'sm']}>
              Your microphone is on.
            </Text>
          </>
        )}
      </Box>
    </Center>
  )

  let statusText
  if (!isRemoteEnded) {
    if (!partner) {
      statusText = 'Searching for a match'
    } else if (!remoteStream || !isConnected) {
      statusText = 'Establishing connection'
    }
  }

  return (
    <Screen bg="blue" headerAction={actionButton} bottomPane={bottomPane}>
      <EndCallModal
        isOpen={isEndCallOpen}
        onClose={onEndCallClose}
        onEndCall={onEndCall}
      />
      <PartnerLeftModal isOpen={isRemoteEnded} onEndCall={onEndCall} />
      <Center flex={3} flexDir="column" textAlign="center">
        {statusText && (
          <>
            <Spinner color="brightRed" boxSize={8} mb={6} />
            <Text color="lightBlue" fontSize={['xs', 'sm']} fontWeight="bold">
              {statusText}&hellip;
            </Text>
            {!partner && (
              <Text color="lightBlue" mt={2} fontSize={'xs'}>
                <Text as="b">{talkingCount}</Text> people talking,{' '}
                <Text as="b">{answeringQuestionsCount}</Text> answering
                questions
              </Text>
            )}
          </>
        )}
        {partner && remoteStream && isConnected && (
          <>
            <Spacer />
            <TimerSince color="lightBlue" fontSize="xs" since={callStartTime} />
            <Waveform colorScheme="darkBlue" stream={remoteStream} m={2} />
            <Stream stream={remoteStream} muted={isSilent} />
            <Text color="lightBlue" fontSize={['lg', 'xl']} fontWeight="bold">
              You're talking with a<br /> {partner.age} year old in{' '}
              {startCase(states[partner.state] ?? 'Unknown')}.
            </Text>
            <Spacer />
            <Flex w="full" minH={40} justifyContent="center">
              {prompts && (
                <Flex w="full" maxW="28rem" px={4} alignItems="center">
                  <CallPrompt
                    flex={1}
                    my={4}
                    prompt={prompts[currentPromptIdx]}
                  />
                  <IconButton
                    colorScheme="grayBlue"
                    variant="faint"
                    isRound
                    w="12"
                    h="12"
                    fontSize="xxl"
                    ml={2}
                    icon={<NextIcon />}
                    onClick={handleNextPrompt}
                    aria-label="Next conversation prompt"
                  />
                </Flex>
              )}
            </Flex>
          </>
        )}
      </Center>
    </Screen>
  )
}
