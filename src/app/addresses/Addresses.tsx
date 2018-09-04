import * as React from 'react'
import { Component } from 'react'
import { Address } from '../../db/types'
import { Typography } from '@material-ui/core'
import List from '@material-ui/core/List'
import { Link } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import { map } from 'lodash/fp'
import Button from '@material-ui/core/Button/'
import AddIcon from '@material-ui/icons/Add'
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
          <Typography variant="title" color="inherit">Addresses</Typography>
          <List component="nav">
            {
              map(address => (
                <ListItem key={address.addressId}>
                  {address.label} - {address.houseNumber} {address.street} {address.city} 
                </ListItem>
              ), this.props.addresses)
            }
          </List>
          <Link to="/addresses/new"><Button color="primary" variant="fab"><AddIcon /></Button></Link>
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