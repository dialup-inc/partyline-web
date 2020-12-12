import states from './states.json'

import { PartnerInfo as ServerPartnerInfo } from './generated-types'
export type PartnerInfo = ServerPartnerInfo & { state: keyof typeof states }

export {
  Question,
  Response,
  Prompt,
  PartnerPayload,
  SessionPayload,
  InfoPayload,
  LoginPayload,
  SignalPayload,
  ErrorPayload,
  HeartbeatPayload,
  PushTokenSaveRequest,
  ResponseSaveRequest,
  RTCIceServer,
} from './generated-types'
