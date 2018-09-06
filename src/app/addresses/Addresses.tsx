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

interface AddressesProps {
  addresses: ReadonlyArray<Address>
}

namespace UI {
  export class Addresses extends Component<AddressesProps> {
    render() {
      return (
        <div>
          Addresses
          <div>
            {
              map(address => (
                <div key={address.addressId}>
                  <Link to={`/addresses/${address.addressId}`}>
                    {address.label} - {address.houseNumber} {address.street} {address.city} 
                  </Link>
                </div>
              ), this.props.addresses)
            }
          </div>
          <Link to="/create-address"><button>New</button></Link>
        </div>
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