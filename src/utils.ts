import { match } from 'path-to-regexp'
import { getAppList } from './appList'
import { IInternalAppInfo } from './types'
import { AppStatus } from './enum'

export const getAppListStatus = () => {
  const loads: IInternalAppInfo[] = []
  const mounts: IInternalAppInfo[] = []
  const unmounts: IInternalAppInfo[] = []

  const list = getAppList() as IInternalAppInfo[]
  list.forEach((app) => {
    const isActive = match(app.activeRule, { end: false })(location.pathname)
    switch (app.status) {
      case AppStatus.NOT_LOADED:
        isActive && loads.push(app)
        break
      case AppStatus.LOADED:
      case AppStatus.NOT_MOUNTED:
        isActive && mounts.push(app)
        break
      case AppStatus.MOUNTED:
        !isActive && unmounts.push(app)
        break
    }
  })

  return { loads, mounts, unmounts }
}
