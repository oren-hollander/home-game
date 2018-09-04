import * as React from 'react'
import { SFC } from 'react'

export const Page: SFC = ({ children }) =>
  <div style={{ backgroundColor: 'yellow'}}>
    { children }
  </div>
