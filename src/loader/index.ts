import { IInternalAppInfo } from '../types'
import { importEntry } from 'import-html-entry'

export const loadHTML = async (app: IInternalAppInfo) => {
  const { container, entry } = app

  const { template, getExternalScripts, getExternalStyleSheets } =
    await importEntry(entry)
  const dom = document.querySelector(container)

  if (!dom) {
    throw new Error('容器不存在')
  }

  dom.innerHTML = template

  await getExternalStyleSheets()
  const jsCode = await getExternalScripts()

  jsCode.forEach((script) => {
    const lifeCycle = runJS(script, app)
    if (lifeCycle) {
      app.bootstrap = lifeCycle.bootstrap
      app.mount = lifeCycle.mount
      app.unmount = lifeCycle.unmount
    }
  })

  return app
}

const runJS = (value: string, app: IInternalAppInfo) => {
  const code = `
    ${value}
    return window['${app.name}']
  `
  return new Function(code).call(window, window)
}
