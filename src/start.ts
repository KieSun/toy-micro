import { getAppList, setAppList } from './appList'
import { setLifeCycle } from './lifeCycle'
import { IAppInfo, IInternalAppInfo, ILifeCycle } from './types'
import { hijackRoute, reroute } from './route'
import { AppStatus } from './enum'
import { prefetch } from './utils'

export const registerMicroApps = (
  appList: IAppInfo[],
  lifeCycle?: ILifeCycle
) => {
  setAppList(appList)
  lifeCycle && setLifeCycle(lifeCycle)
}

export const start = () => {
  const list = getAppList()
  if (!list.length) {
    throw new Error('请先注册应用')
  }

  hijackRoute()
  reroute(window.location.href)

  list.forEach((app) => {
    if ((app as IInternalAppInfo).status === AppStatus.NOT_LOADED) {
      prefetch(app as IInternalAppInfo)
    }
  })
}
