import * as React from 'react'
import { SFC } from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { getError } from './statusReducer'

interface ErrorProps {
  message: string
}


namespace UI {
  export const Error: SFC<ErrorProps> = ({ message }) => 
    <div style={{ border: '1px solid orange', backgroundColor: 'pink'}}>
      {message || 'ok'}
    </div>
}

const mapStateToProps: MapStateToProps<ErrorProps, {}, State> = (state): ErrorProps => ({
  message: getError(state)
})


export const Error: React.ComponentType = connect(mapStateToProps)(UI.Error) 
