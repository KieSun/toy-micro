export interface IAppInfo {
  name: string
  entry: string
  container: string
  activeRule: string
}

export interface ILifeCycle {
  beforeLoad?: LifeCycle | LifeCycle[]
  mounted?: LifeCycle | LifeCycle[]
  unmounted?: LifeCycle | LifeCycle[]
}

export type LifeCycle = (app: IAppInfo) => Promise<any>

export type EventType = 'hashchange' | 'popstate'