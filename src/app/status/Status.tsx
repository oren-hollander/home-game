import * as React from 'react'
import { SFC } from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { getStatus } from './statusReducer'

interface StatusProps {
  status: string
}

namespace UI {
  export const Status: SFC<StatusProps> = ({ status }) => 
    <div style={{backgroundColor: 'lightblue', border: '1px solid red'}}>
      {status || 'ok'}
    </div>
}

const mapStateToProps: MapStateToProps<StatusProps, {}, State> = (state): StatusProps => ({
  status: getStatus(state)
})

export const Status = connect(mapStateToProps)(UI.Status)