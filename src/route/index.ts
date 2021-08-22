import { EventType } from '../types'
import { getAppList } from '../appList'

const capturedListeners: Record<EventType, Function[]> = {
  hashchange: [],
  popstate: []
}

const originalPush = window.history.pushState;
const originalReplace = window.history.replaceState;

let historyEvent: PopStateEvent | null = null;

let lastUrl: string | null = null;

export const reroute = (url: string) => {
  if (url !== lastUrl) {
    const list = getAppList()
    console.log(list)
    lastUrl = url
  }
}

const handleUrlChange = () => {
  reroute(location.href)
}

export const hijackRoute = () => {
  window.history.pushState = (...args) => {
    originalPush.apply(window.history, args)
    historyEvent = new PopStateEvent('popstate');
    args[2] && reroute(args[2])
  }
  window.history.replaceState = (...args) => {
    originalReplace.apply(window.history, args)
    historyEvent = new PopStateEvent('popstate');
    args[2] && reroute(args[2])
  }

  window.addEventListener('hashchange', handleUrlChange)
  window.addEventListener('popstate', handleUrlChange)

  window.addEventListener = hijackEventListener(window.addEventListener)
  window.removeEventListener = hijackEventListener(window.removeEventListener)
}

const hasListeners = (name: EventType, fn: Function) => {
  return capturedListeners[name].filter(listener => listener === fn).length
}

const hijackEventListener = (func: Function): any => {
  return function (name: string, fn: Function) {
    if (name === 'hashchange' || name === 'popstate') {
      if (!hasListeners(name, fn)) {
        capturedListeners[name].push(fn)
        return
      } else {
        capturedListeners[name] = capturedListeners[name].filter(listener => listener !== fn)
      }
    }
    return func.apply(window, arguments)
  }
}

export function callCapturedListeners() {
  if (historyEvent) {
    Object.keys(capturedListeners).forEach(eventName => {
      const listeners = capturedListeners[eventName as EventType];
      if (listeners.length) {
        listeners.forEach(listener => {
          // @ts-ignore
          listener.call(this, historyEvent);
        });
      }
    });
    historyEvent = null;
  }
}