import * as React from 'react'
import { SFC } from 'react'

namespace UI {
  export const Toolbar: SFC = ({ children }) => 
    <div style={{border: '1px solid blue', backgroundColor: 'cyan'}}>
      { children }
    </div>
}

export const Toolbar = UI.Toolbar