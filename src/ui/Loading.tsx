import * as React from 'react'
import { SFC } from 'react'
import { DataStatus } from '../data/dataStatus'
import { Alert, Fade } from 'reactstrap'

interface LoadingProps {
  dataStatus: DataStatus
}

export const Loading: SFC<LoadingProps> = ({ dataStatus }) => {
  if (dataStatus === 'fresh') {
    return null
  }

  return <Fade><Alert color="info">Loading</Alert></Fade>
}
