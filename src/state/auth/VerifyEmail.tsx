import * as React from 'react'
import {SFC} from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import {connect, MapDispatchToProps} from 'react-redux'
import {sendEmailVerification} from "./authActions";

interface VerifyEmailComponentProps {
  verifyEmail: () => void
}

export const VerifyEmailComponent: SFC<VerifyEmailComponentProps> = ({verifyEmail}) =>
  <div>
    <Typography color="primary" variant="caption">
      Verify your email. An email with a link will be sent to you. click on that link.
    </Typography>
    <Button color="primary" variant="contained" onClick={verifyEmail}>Verify</Button>
  </div>


const mapDispatchToProps: MapDispatchToProps<VerifyEmailComponentProps, {}> = dispatch => ({
  verifyEmail(){
    dispatch(sendEmailVerification())
  }
})

export const VerifyEmail = connect(undefined, mapDispatchToProps)(VerifyEmailComponent)