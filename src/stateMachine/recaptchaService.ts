import { InvokeCreator } from 'xstate'
import { auth } from 'firebase/app'

type RecaptchaShowEvent = {
  type: 'RECAPTCHA.SHOW'
}
type RecaptchaCancelEvent = {
  type: 'RECAPTCHA.CANCEL'
}
type RecaptchaSuccessEvent = {
  type: 'RECAPTCHA.SUCCESS'
  recaptchaVerifier: auth.RecaptchaVerifier
}
export type RecaptchaEvent =
  | RecaptchaShowEvent
  | RecaptchaCancelEvent
  | RecaptchaSuccessEvent

function getIframe(): HTMLIFrameElement {
  return document.querySelector(
    'iframe[src^="https://www.google.com/recaptcha"][src*="bframe"]',
  )
}

function waitForRecaptchaIframe(): Promise<HTMLIFrameElement> {
  return new Promise((resolve) => {
    const iframeEl = getIframe()
    if (iframeEl) {
      resolve(iframeEl)
    }
    const observer = new MutationObserver(() => {
      const iframeEl = getIframe()
      if (iframeEl) {
        resolve(iframeEl)
      }
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
    })
  })
}

function onRecaptchaClose(iframeEl: HTMLIFrameElement, callback: () => void) {
  // via https://stackoverflow.com/a/43194469
  const container = iframeEl.parentElement.parentElement
  const observer = new MutationObserver(() => {
    if (container && container.style.visibility === 'hidden') {
      callback()
    }
  })
  observer.observe(container, {
    attributes: true,
    attributeFilter: ['style'],
  })
}

const recaptchaService: InvokeCreator<any, RecaptchaEvent> = (_, event) => (
  callback,
  onReceive,
) => {
  // For the following two reasons, I did not find a react element implementation for this to be viable, which is why it's raised into a global XState service:

  // The container element needs to be a global, long-lived element.
  const containerEl = document.createElement('div')
  containerEl.id = 'recaptcha-container'
  document.body.appendChild(containerEl)

  // The verifier must also be global and persist across recaptcha invocations.
  const recaptchaVerifier = new auth.RecaptchaVerifier(containerEl, {
    size: 'invisible',
  })

  async function showRecaptcha() {
    await recaptchaVerifier.render()

    const iframeEl = await waitForRecaptchaIframe()
    onRecaptchaClose(iframeEl, () => {
      callback('RECAPTCHA.CANCEL')
    })

    await recaptchaVerifier.verify()
    callback({ type: 'RECAPTCHA.SUCCESS', recaptchaVerifier })
  }

  onReceive((ev: RecaptchaEvent) => {
    if (ev.type === 'RECAPTCHA.SHOW') {
      showRecaptcha()
    }
  })

  return () => {
    document.body.removeChild(containerEl)
  }
}

export default recaptchaService
