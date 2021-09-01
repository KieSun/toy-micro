import { IAppInfo, IInternalAppInfo, ILifeCycle } from '../types'
import { AppStatus } from '../enum'
import { loadHTML } from '../loader'

let lifeCycle: ILifeCycle = {}

export const setLifeCycle = (list: ILifeCycle) => {
  lifeCycle = list
}

export const getLifeCycle = () => {
  return lifeCycle
}

export const runBeforeLoad = async (app: IInternalAppInfo) => {
  app.status = AppStatus.LOADING
  await runLifeCycle('beforeLoad', app)

  app = await loadHTML(app)
  app.status = AppStatus.LOADED
}

export const runBoostrap = async (app: IInternalAppInfo) => {
  if (app.status !== AppStatus.LOADED) {
    return app
  }
  app.status = AppStatus.BOOTSTRAPPING
  await app.bootstrap?.(app)
  app.status = AppStatus.NOT_MOUNTED
}

export const runMounted = async (app: IInternalAppInfo) => {
  app.status = AppStatus.MOUNTING
  await app.mount?.(app)
  app.status = AppStatus.MOUNTED
  await runLifeCycle('mounted', app)
}

export const runUnmounted = async (app: IInternalAppInfo) => {
  app.status = AppStatus.UNMOUNTING
  app.proxy.inactive()
  await app.unmount?.(app)
  app.status = AppStatus.NOT_MOUNTED
  await runLifeCycle('unmounted', app)
}

const runLifeCycle = async (name: keyof ILifeCycle, app: IAppInfo) => {
  const fn = lifeCycle[name]
  if (fn instanceof Array) {
    await Promise.all(fn.map((item) => item(app)))
  } else {
    await fn?.(app)
  }
}
