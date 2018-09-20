import * as React from 'react'
import { ComponentType, SFC } from 'react'
import { connect } from 'react-redux'
import { Address } from '../../db/types'
import { updateAddress, loadAddress } from './addressesActions'
import { HomeGameThunkDispatch } from '../state'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { SetAddress, SetAddressProps } from './SetAddress'
import { getAddress } from './addressesReducer'
import { dataLoader, CompProps } from '../../data/dataLoader'
import { markStale, markFresh } from '../dataStatus/dataStatusActions';
import { getDataStatus } from '../dataStatus/dataStatusReducer';

type SetAddressDispatchProps = Pick<SetAddressProps, 'showError' | 'setAddress'>

const EditAddressAdapter: SFC<SetAddressProps> = props => <SetAddress buttonLabel="Update" {...props} />

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): SetAddressDispatchProps => ({
  showError: (error: string) => dispatch(showStatus(ErrorStatus(error))),
  setAddress: (address: Address) => dispatch(updateAddress(address))
})

const EditAddressConnector: ComponentType<{address?: Address, fresh: boolean}> = connect(
  undefined,
  mapDispatchToProps
)(EditAddressAdapter)

const EditAddressConnectorAdapter: SFC<CompProps<Address | undefined>> = ({ data, dataStatus }) => 
  <EditAddressConnector address={data} fresh={dataStatus === 'fresh'} />

export interface EditAddressProps {
  addressId: string
}

const propsToParams = (props: EditAddressProps): string => props.addressId

export const EditAddress: ComponentType<EditAddressProps> = dataLoader(
  propsToParams,
  loadAddress,
  markStale('addresses'),
  markFresh('addresses'),
  getAddress,
  getDataStatus('addresses')
)(EditAddressConnectorAdapter)
