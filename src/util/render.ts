import { ReactElement } from 'react'
import { render as domRender } from 'react-dom'

export const render = async (element: ReactElement<any>, container: HTMLElement) =>
  new Promise(resolve => {
    domRender(element, container, resolve)
  })
