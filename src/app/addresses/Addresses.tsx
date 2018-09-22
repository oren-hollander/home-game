import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Address } from '../../db/types'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { Page } from '../../ui/Page'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { connect } from 'react-redux'
import { getAddresses } from './addressesReducer'
import { State } from '../state'

namespace UI {
  export interface AddressesProps {
    addresses: ReadonlyArray<Address>
  }

  export const Addresses: SFC<AddressesProps> = ({ addresses }) => (
    <Page>
      <ListGroup>
        {map(
          address => (
            <ListGroupItem key={address.addressId}>
              <Link to={`/addresses/${address.addressId}`}>
                {address.label} - {address.houseNumber} {address.street} {address.city}
              </Link>
            </ListGroupItem>
          ),
          addresses
        )}
        <ListGroupItem color="primary">
          <Link to="/addresses/new">Create new address</Link>
        </ListGroupItem>
      </ListGroup>
    </Page>
  )
}

const mapStateToProps = (state: State): UI.AddressesProps => ({
  addresses: getAddresses(state)
})

export const Addresses: ComponentType<{}> = connect<{}, UI.AddressesProps, {}, State>(mapStateToProps)(UI.Addresses)
