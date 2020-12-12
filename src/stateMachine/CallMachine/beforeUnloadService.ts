import { InvokeCreator } from 'xstate'

const beforeUnloadService: InvokeCreator<any, any> = () => (
  callback,
  onReceive,
) => {
  function preventAccidentalClose(ev: BeforeUnloadEvent) {
    ev.preventDefault()
    ev.returnValue = ''
  }

  window.addEventListener('beforeunload', preventAccidentalClose)

  return () => {
    window.removeEventListener('beforeunload', preventAccidentalClose)
  }
}

export default beforeUnloadService
