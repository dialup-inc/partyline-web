const devCommands: { [key: string]: any } = {}

declare global {
  interface Window {
    dev: typeof devCommands
  }
}

export function init() {
  window.dev = devCommands
}

export function register(name: string, value: any) {
  devCommands[name] = value
}
