import { IInternalAppInfo } from '../types'
import { fetchResource } from '../utils'
import { parseHTML } from './parse'

export const loadHTML = async (app: IInternalAppInfo) => {
  const { container, entry } = app

  const htmlFile = await fetchResource(entry)
  const dom = document.querySelector(container)

  if (!dom) {
    throw new Error('容器不存在')
  }

  const fakeContainer = document.createElement('div')
  fakeContainer.innerHTML = htmlFile
  const { scripts, links, inlineScript } = parseHTML(fakeContainer, app)

  dom.innerHTML = fakeContainer.innerHTML

  await Promise.all(links.map((link) => fetchResource(link)))

  const jsCode = (
    await Promise.all(scripts.map((script) => fetchResource(script)))
  ).concat(inlineScript)

  jsCode.forEach((script) => {
    const lifeCycle = runJS(script, app)
    console.log(lifeCycle)
    // app.bootstrap = lifeCycle.bootstrap
    // app.mount = lifeCycle.mount
    // app.unmount = lifeCycle.unmount
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
