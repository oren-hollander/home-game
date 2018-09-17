import * as React from 'react'
import { SFC } from 'react'
import { Alert, Fade } from 'reactstrap'

interface LoadingProps {
  fresh: boolean
}

export const Loading: SFC<LoadingProps> = ({ fresh }) =>
  fresh ? null : (
    <Fade>
      <Alert color="info">Loading</Alert>
    </Fade>
  )
