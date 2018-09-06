import * as React from 'react'
import { SFC } from 'react'

namespace UI {
  export const Toolbar: SFC = ({ children }) => 
    <div>
      { children }
    </div>
}

export const Toolbar = UI.Toolbar