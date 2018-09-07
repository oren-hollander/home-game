import * as React from 'react'
import { SFC } from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { getStatus, StatusMessage, StatusType } from './statusReducer'
import { Alert, Fade } from 'reactstrap'
import { isUndefined } from 'lodash/fp'

interface StatusProps {
  status?: StatusMessage
}

const getAlertColor = (statusType: StatusType): string => {
  switch(statusType) {
    case 'error':
      return 'danger'
    case 'success': 
      return 'success'
    case 'info':
      return 'info'
    case 'warning':
      return 'warning'
  }
}

namespace UI {
  export const Status: SFC<StatusProps> = ({ status }) => 
    <Fade in={!isUndefined(status)}>
      {
        !isUndefined(status) && 
        <Alert color={getAlertColor(status!.type)}>
          { status!.text }
        </Alert>
      }
    </Fade>
}

const mapStateToProps: MapStateToProps<StatusProps, {}, State> = (state): StatusProps => ({
  status: getStatus(state)
})

export const Status = connect(mapStateToProps)(UI.Status)