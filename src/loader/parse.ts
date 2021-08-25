import { getCompletionURL } from '../utils'
import { IInternalAppInfo } from '../types'

const scripts: string[] = []
const links: string[] = []
const inlineScript: string[] = []

export const parseHTML = (parent: HTMLElement, app: IInternalAppInfo) => {
  const children = Array.from(parent.children) as HTMLElement[]
  children.length && children.forEach((item) => parseHTML(item, app))

  for (const dom of children) {
    if (/^(link)$/i.test(dom.tagName)) {
      const data = parseLink(dom, parent, app)
      data && links.push(data)
    } else if (/^(script)$/i.test(dom.tagName)) {
      const data = parseScript(dom, parent, app)
      data.text && inlineScript.push(data.text)
      data.url && scripts.push(data.url)
    } else if (/^(img)$/i.test(dom.tagName) && dom.hasAttribute('src')) {
      dom.setAttribute(
        'src',
        getCompletionURL(dom.getAttribute('src')!, app.entry)!
      )
    }
  }

  return { scripts, links, inlineScript }
}

const parseScript = (
  script: HTMLElement,
  parent: HTMLElement,
  app: IInternalAppInfo
) => {
  let comment: Comment | null
  const src = script.getAttribute('src')
  if (src) {
    comment = document.createComment('script replaced by micro')
  } else if (script.innerHTML) {
    comment = document.createComment('inline script replaced by micro')
  }
  // @ts-ignore
  comment && parent.replaceChild(comment, script)
  return { url: getCompletionURL(src, app.entry), text: script.innerHTML }
}

const parseLink = (
  link: HTMLElement,
  parent: HTMLElement,
  app: IInternalAppInfo
) => {
  const rel = link.getAttribute('rel')
  const href = link.getAttribute('href')
  let comment: Comment | null
  if (rel === 'stylesheet' && href) {
    comment = document.createComment(`link replaced by micro`)
    // @ts-ignore
    comment && parent.replaceChild(comment, script)
    return getCompletionURL(href, app.entry)
  } else if (href) {
    link.setAttribute('href', getCompletionURL(href, app.entry)!)
  }
}
