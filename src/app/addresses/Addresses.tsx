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
import { Page } from '../../ui/Page'
import { ListGroup, ListGroupItem } from 'reactstrap'

interface AddressesProps {
  addresses: ReadonlyArray<Address>
}

namespace UI {
  export class Addresses extends Component<AddressesProps> {
    render() {
      return (
        <Page>
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
        </Page>
      )
    }
  }
}

const mapStateToProps = (state: State): AddressesProps => ({
   addresses: getAddresses(state)
})

export const Addresses = compose(
  load(loadAddresses),
  connect(mapStateToProps)
)(UI.Addresses)