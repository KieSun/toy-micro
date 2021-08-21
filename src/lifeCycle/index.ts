import { ILifeCycle } from '../types'

let lifeCycle: ILifeCycle = {}

export const setLifeCycle = (list: ILifeCycle) => {
  lifeCycle = list
}

export const getLifeCycle = () => {
  return lifeCycle
}