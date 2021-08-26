import { EventType } from '../types'
import { beforeLoad, mounted, unmounted } from '../lifeCycle'
import { getAppListStatus } from '../utils'

const capturedListeners: Record<EventType, Function[]> = {
  hashchange: [],
  popstate: [],
}

const originalPush = window.history.pushState
const originalReplace = window.history.replaceState

let historyEvent: PopStateEvent | null = null

let lastUrl: string | null = null

export const reroute = (url: string) => {
  console.log(url, lastUrl)
  if (url !== lastUrl) {
    const { actives, unmounts } = getAppListStatus()
    Promise.all(
      unmounts
        .map(async (app) => {
          await unmounted(app)
        })
        .concat(
          actives.map(async (app) => {
            await beforeLoad(app)
            await mounted(app)
          })
        )
    ).then(() => {
      // callCapturedListeners()
    })
  }
  lastUrl = url || location.href
}

const handleUrlChange = () => {
  reroute(location.href)
}

export const hijackRoute = () => {
  window.history.pushState = (...args) => {
    originalPush.apply(window.history, args)
    historyEvent = new PopStateEvent('popstate')
    console.log(args[2], '=======================')
    args[2] && reroute(args[2])
  }
  window.history.replaceState = (...args) => {
    originalReplace.apply(window.history, args)
    historyEvent = new PopStateEvent('popstate')
    console.log(args[2], '========================')
    args[2] && reroute(args[2])
  }

  window.addEventListener('hashchange', handleUrlChange)
  window.addEventListener('popstate', handleUrlChange)

  window.addEventListener = hijackEventListener(window.addEventListener)
  window.removeEventListener = hijackEventListener(window.removeEventListener)
}

const hasListeners = (name: EventType, fn: Function) => {
  return capturedListeners[name].filter((listener) => listener === fn).length
}

const hijackEventListener = (func: Function): any => {
  return function (name: string, fn: Function) {
    if (name === 'hashchange' || name === 'popstate') {
      if (!hasListeners(name, fn)) {
        capturedListeners[name].push(fn)
        return
      } else {
        capturedListeners[name] = capturedListeners[name].filter(
          (listener) => listener !== fn
        )
      }
    }
    return func.apply(window, arguments)
  }
}

export function callCapturedListeners() {
  if (historyEvent) {
    Object.keys(capturedListeners).forEach((eventName) => {
      const listeners = capturedListeners[eventName as EventType]
      if (listeners.length) {
        listeners.forEach((listener) => {
          // @ts-ignore
          listener.call(this, historyEvent)
        })
      }
    })
    historyEvent = null
  }
}

export function cleanCapturedListeners() {
  capturedListeners['hashchange'] = []
  capturedListeners['popstate'] = []
}
