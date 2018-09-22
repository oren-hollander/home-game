import { ComponentType } from 'react'
import { connect } from 'react-redux'
import { Address } from '../../db/types'
import { updateAddress } from './addressesActions'
import { HomeGameThunkDispatch, State } from '../state'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { SetAddress, SetAddressProps } from './SetAddress'
import { getAddress } from './addressesReducer'

type SetAddressDispatchProps = Pick<SetAddressProps, 'showError' | 'setAddress'>
type SetAddressStateProps = Pick<SetAddressProps, 'address' | 'buttonLabel'>

export interface EditAddressProps {
  readonly addressId: string
}

const mapStateToProps = (state: State, ownProps: EditAddressProps) => ({
  address: getAddress(state, ownProps.addressId),
  buttonLabel: 'Update'
})

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): SetAddressDispatchProps => ({
  showError: (error: string) => dispatch(showStatus(ErrorStatus(error))),
  setAddress: (address: Address) => dispatch(updateAddress(address))
})

export const EditAddress: ComponentType<EditAddressProps> = connect<
  SetAddressStateProps,
  SetAddressDispatchProps,
  EditAddressProps,
  State
>(
  mapStateToProps,
  mapDispatchToProps
)(SetAddress)
