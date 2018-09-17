import * as React from 'react'
import { SFC } from 'react'
import { Addresses } from './Addresses'
import { dataLoader, CompProps } from '../../data/dataLoader'
import { loadAddresses, markFresh, markStale } from './addressesActions'
import { getAddresses, getDataStatus } from './addressesReducer'
import { Address } from '../../db/types'
import { noop } from 'lodash/fp'

const AddressesAdapter: SFC<CompProps<ReadonlyArray<Address>>> = ({ data, dataStatus }) => (
  <Addresses addresses={data} fresh={dataStatus === 'fresh'} />
)

export const AddressesLoader = dataLoader(noop, loadAddresses, markStale, markFresh, getAddresses, getDataStatus)(
  AddressesAdapter
)
