import * as React from 'react'
import { SFC } from 'react'
import { Status } from '../app/status/Status'
import { Error } from '../app/status/Error'

export const StatusBar: SFC = () => 
  <div> 
    <Status/>
    <Error/>
  </div>