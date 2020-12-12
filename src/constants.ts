export const API_ENDPOINT = process.env.API_ENDPOINT
export const WS_ENDPOINT = process.env.WS_ENDPOINT
export const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
}
export const WEBRTC_CONFIG = {
  iceServers: [{ urls: 'stun:global.stun.twilio.com:3478?transport=udp' }],
}
export const INITIAL_QUESTION_COUNT = 3
export const SIGN_UP_STEPS = 4
export const SIGN_IN_STEPS = 3
export const SHARE_INFO = {
  title: 'PartyLine - 🇺🇸 Connect with other Americans',
  text:
    'Chat with another person across the political spectrum through live voice.',
  url: 'https://partyline.chat',
}
export const SHARE_MSG = `${SHARE_INFO.text} ${SHARE_INFO.url}`
export const RTC_TIMEOUT = 15 * 1000
export const PUSH_VAPID_KEY = ''
