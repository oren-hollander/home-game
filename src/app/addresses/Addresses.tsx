import * as React from 'react'
import { SFC } from 'react'
import { Address } from '../../db/types'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { Page } from '../../ui/Page'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Loading } from '../../ui/Loading'
import { dataLoader, CompProps } from '../../data/dataLoader'
import { loadAddresses } from './addressesActions'
import { getAddresses } from './addressesReducer'
import { noop } from 'lodash/fp'
import { markStale, markFresh } from '../dataStatus/dataStatusActions'
import { getDataStatus } from '../dataStatus/dataStatusReducer'
import { compose, mapProps } from 'recompose'

export interface AddressesProps {
  addresses: ReadonlyArray<Address>
  fresh: boolean
}

namespace UI {
  export const Addresses: SFC<AddressesProps> = ({ addresses, fresh }) => (
    <Page>
      <Loading fresh={fresh} />
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

const mapAddressesProps = mapProps<AddressesProps, CompProps<ReadonlyArray<Address>>>(({ data, dataStatus }) => ({
  addresses: data,
  fresh: dataStatus === 'fresh'
}))

export const Addresses = compose(
  dataLoader(
    noop,
    loadAddresses,
    markStale('addresses'),
    markFresh('addresses'),
    getAddresses,
    getDataStatus('addresses')
  ),
  mapAddressesProps
)(UI.Addresses)
