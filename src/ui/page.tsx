import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Status } from '../app/status/Status'
import { Toolbar } from '../ui/Toolbar'
import { Container, Row, Col } from 'reactstrap'
import { connect } from 'react-redux'
import { State } from '../app/state'
import { getSignedInUser, isUserSignedIn } from '../app/auth/authReducer'

interface PageProps {
  toolbar?: boolean
  name?: string
}

namespace UI {
  export const Page: SFC<PageProps> = ({ toolbar, name, children }) => (
    <>
      {toolbar !== false && <Toolbar name="Player 1" />}
      <Container style={{ paddingTop: '16px' }}>
        {name && (
          <Row>
            <Col>{name}</Col>
          </Row>
        )}
        <Row>
          <Col>{children}</Col>
        </Row>
        <Row>
          <Col>
            <Status />
          </Col>
        </Row>
      </Container>
    </>
  )
}

const mapStateToProps = (state: State): { name?: string } => {
  if (isUserSignedIn(state)) {
    return {
      name: getSignedInUser(state).name
    }
  }
  return {}
}

export const Page: ComponentType<{ toolbar?: boolean }> = connect(mapStateToProps)(UI.Page)
