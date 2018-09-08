import * as React from 'react'
import { SFC } from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { sendEmailVerification } from './authActions'
import { State, HomeGameThunkDispatch } from '../state'
import { getUser, getUserEmail } from './authReducer'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { Status } from '../status/Status'
import { Toolbar } from '../../ui/Toolbar'
import {
  Button,
  Jumbotron,
  Container, Row, Col
} from 'reactstrap'

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
    <>
      <Toolbar path={[]} />
      <Container style={{ paddingTop: '16px' }}>
        <Row>
          <Col>
            <Jumbotron>
              <p>
                {name}, the email you signed up with ({email}) is not yet verified.
              </p>
              <p>
                To verify your email address, click on the button below.
              </p>
              <p>
                An email with a link will be sent to you. click on that link to veryfy your email address.
              </p>
              <Button color="primary" onClick={sendEmailVerification}>Send</Button>
            </Jumbotron>
          </Col>
        </Row>
        <Row>
          <Col>
            <Status />
          </Col>
        </Row>
      </Container>
    </>
}

const mapDispatchToProps: MapDispatchToProps<EmailVerificationDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): EmailVerificationDispatchProps => ({
  sendEmailVerification(){
    dispatch(sendEmailVerification())
  },
  showError(error: string) {
    dispatch(showStatus(ErrorStatus(error)))
  }
})

const mapStateToProps: MapStateToProps<EmailVerificationStateProps, {}, State> = state => ({
  name: getUser(state).name,
  email: getUserEmail(state)
})

export const EmailVerification = connect(mapStateToProps, mapDispatchToProps)(UI.EmailVerification)