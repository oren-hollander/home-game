import * as React from 'react'
import { Component } from 'react'
import { Address } from '../../db/types'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { load } from '../../data/load'
import { loadAddresses } from './addressesActions'
import { getAddresses } from './addressesReducer'
import { State } from '../state'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Status } from '../status/Status'
import { Toolbar } from '../../ui/Toolbar'
import {
  ListGroup, ListGroupItem,
  Container, Row, Col
} from 'reactstrap'

interface AddressesProps {
  addresses: ReadonlyArray<Address>
}

namespace UI {
  export class Addresses extends Component<AddressesProps> {
    render() {
      return (
        <>
          <Toolbar path={[{title: 'Home', path: '/'}]}/>
          <Container style={{ paddingTop: '16px' }}>
            <Row>
              <Col>
                <ListGroup>
                  {
                    map(address => (
                      <ListGroupItem key={address.addressId}>
                        <Link to={`/addresses/${address.addressId}`}>
                          {address.label} - {address.houseNumber} {address.street} {address.city}
                        </Link>
                      </ListGroupItem>
                    ), this.props.addresses)
                  }
                  <ListGroupItem color="primary">
                    <Link to="/addresses/new">Create new address</Link>
                  </ListGroupItem>
                </ListGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <Status />
              </Col>
            </Row>
          </Container >
        </>
      )
    }
  }
}

const mapStateToProps = (state: State): AddressesProps => {
  const x = getAddresses(state)
  return {
    addresses: x
  }
}

export const Addresses = compose(
  load(loadAddresses),
  connect(mapStateToProps)
)(UI.Addresses)