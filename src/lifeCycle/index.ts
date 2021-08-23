import { ILifeCycle, IAppInfo, IInternalAppInfo } from '../types'
import { AppStatus } from '../enum'
import { loadHTML } from '../loader'

let lifeCycle: ILifeCycle = {}

export const setLifeCycle = (list: ILifeCycle) => {
  lifeCycle = list
}

export const getLifeCycle = () => {
  return lifeCycle
}

export const beforeLoad = async (app: IInternalAppInfo) => {
  app.status = AppStatus.NOT_LOADED
  await runLifeCycle('beforeLoad', app)

  const childrenApp = await loadHTML(app)
  app.status = AppStatus.LOADED
  await childrenApp.bootstrap?.(app)

  return childrenApp
}

export const mounted = async (app: IInternalAppInfo) => {
  app.status = AppStatus.NOT_MOUNTED
  await app.mount?.(app)
  app.status = AppStatus.MOUNTED
  await runLifeCycle('mounted', app)
  return app
}

export const unmounted = async (app: IInternalAppInfo) => {
  app.status = AppStatus.UNMOUNTING
  await app.unmount?.(app)
  app.status = AppStatus.NOT_MOUNTED
  await runLifeCycle('unmounted', app)
  return app
}

const runLifeCycle = async (name: keyof ILifeCycle, app: IAppInfo) => {
  const fn = lifeCycle[name]
  if (fn instanceof Array) {
    await Promise.all(fn.map((item) => item(app)))
  } else {
    await fn?.(app)
  }
}
