import { ComponentType } from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { Address } from '../../db/types'
import { updateAddress, loadAddresses } from './addressesActions'
import { HomeGameThunkDispatch, State } from '../state'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { SetAddress, SetAddressDispatchProps, SetAddressStateProps } from './SetAddress'
import { compose } from 'recompose'
import { load } from '../../data/load'
import { getAddress } from './addressesReducer'

export interface EditAddressProps {
  addressId: string
}

const mapDispatchToProps: MapDispatchToProps<SetAddressDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): SetAddressDispatchProps => ({
  showError: (error: string) => dispatch(showStatus(ErrorStatus(error))),
  setAddress: (address: Address) => dispatch(updateAddress(address))
})

const mapStateToProps: MapStateToProps<SetAddressStateProps, EditAddressProps, State> = (state: State, ownProps: EditAddressProps): SetAddressStateProps => ({
  address: getAddress(ownProps.addressId)(state),
  buttonLabel: 'Update'
})

export const EditAddress: ComponentType<EditAddressProps> = compose(
  load(loadAddresses),
  connect(mapStateToProps, mapDispatchToProps)
)(SetAddress) as ComponentType<EditAddressProps>
