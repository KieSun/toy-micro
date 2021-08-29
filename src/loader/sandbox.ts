export class ProxySandbox {
  proxy: any
  running = false
  constructor() {
    const fakeWindow = Object.create(null)
    const proxy = new Proxy(fakeWindow, {
      set: (target: any, p: string, value: any) => {
        if (this.running) {
          target[p] = value
        }
        return true
      },
      get(target: any, p: string): any {
        switch (p) {
          case 'window':
          case 'self':
          case 'globalThis':
            return proxy
        }
        if (
          !window.hasOwnProperty.call(target, p) &&
          window.hasOwnProperty(p)
        ) {
          // @ts-ignore
          const value = window[p]
          if (typeof value === 'function') return value.bind(window)
          return value
        }
        return target[p]
      },
      has() {
        return true
      },
    })
    this.proxy = proxy
  }
  active() {
    this.running = true
  }
  inactive() {
    this.running = false
  }
}
