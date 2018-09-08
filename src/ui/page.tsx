import * as React from 'react'
import { SFC } from 'react'
import { Status } from '../app/status/Status'
import { Toolbar } from '../ui/Toolbar'
import { Container, Row, Col } from 'reactstrap'

interface PageProps {
  toolbar?: boolean
}

export const Page: SFC<PageProps> = ({ toolbar, children }) =>
  <>
    { toolbar !== false && <Toolbar /> }
    <Container style={{ paddingTop: '16px' }}>
      <Row>
        <Col>
          { children }
        </Col>
      </Row>
      <Row>
        <Col>
          <Status />
        </Col>
      </Row>
    </Container >
  </>