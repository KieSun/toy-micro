import { IInternalAppInfo } from '../types'
import { fetchResource } from '../utils'

export const loadHTML = async (app: IInternalAppInfo) => {
  const { container, entry } = app

  const htmlFile = await fetchResource(entry)
  const dom = document.querySelector(container)

  if (!dom) {
    throw new Error('容器不存在')
  }

  dom.innerHTML = htmlFile
  const scripts = await getJS(htmlFile, entry)
  scripts.forEach((script) => {
    const lifeCycle = runJS(script, app)
    console.log(lifeCycle)
    // app.bootstrap = lifeCycle.bootstrap
    // app.mount = lifeCycle.mount
    // app.unmount = lifeCycle.unmount
  })

  return app
}

const fetchLogic = async (src: string, entry?: string) => {
  let file
  if (src.startsWith('http')) {
    file = await fetchResource(src)
  } else {
    file = await fetchResource(`http://${entry}/${src}`)
  }
  return file
}

const getJS = async (html: string, entry: string) => {
  const div = document.createElement('div')
  div.innerHTML = html

  const arr = []
  const scripts = div.querySelectorAll('script')
  const links = div.querySelectorAll('link')

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i]
    const src = script.getAttribute('src')
    if (src) {
      arr.push(await fetchLogic(src, entry))
    } else {
      arr.push(script.innerHTML)
    }
  }

  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const src = link.getAttribute('src')
    if (src && src.endsWith('.js')) {
      arr.push(await fetchLogic(src, entry))
    }
  }

  return arr
}

const runJS = (value: string, app: IInternalAppInfo) => {
  const code = `
    ${value}
    return window['${app.name}']
  `
  return new Function(code).call(window, window)
}
