import * as React from 'react'
import { SFC } from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { sendEmailVerification } from './authActions'
import { State, HomeGameThunkDispatch } from '../state'
import { getUser, getUserEmail } from './authReducer'
import { SignOut } from './SignOut'
import { Page } from '../../ui/page'
import { Toolbar } from '../../ui/toolbar'
import { StatusBar } from '../../ui/statusBar'
import { showError } from '../status/statusActions'

interface EmailVerificationDispatchProps {
  sendEmailVerification(): void
  showError(error: string): void
}

interface EmailVerificationStateProps {
  name: string,
  email: string
}

type EmailVerificationProps = EmailVerificationStateProps & EmailVerificationDispatchProps

namespace UI {
  export const EmailVerification: SFC<EmailVerificationProps> = ({name, email, sendEmailVerification }) => 
    <Page>
      <Toolbar>
        <SignOut />
      </Toolbar>
      <Typography color="primary" variant="caption">
        <p>
          {name}, the email you signed up with ({email}) is not yet verified.
        </p>
        <p>
          To verify your email address, click on the button below.
        </p>
        <p>
          An email with a link will be sent to you. click on that link to veryfy your email address.
        </p>
      </Typography>
      <Button color="primary" variant="contained" onClick={sendEmailVerification}>Send</Button>
      <StatusBar/>
    </Page>
}

const mapDispatchToProps: MapDispatchToProps<EmailVerificationDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): EmailVerificationDispatchProps => ({
  sendEmailVerification(){
    dispatch(sendEmailVerification())
  },
  showError(error: string) {
    dispatch(showError(error))
  }
})

const mapStateToProps: MapStateToProps<EmailVerificationStateProps, {}, State> = state => ({
  name: getUser(state).name,
  email: getUserEmail(state)
})

export const EmailVerification = connect(mapStateToProps, mapDispatchToProps)(UI.EmailVerification)