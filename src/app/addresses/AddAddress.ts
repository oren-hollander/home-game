import { connect } from 'react-redux'
import { Address } from '../../db/types'
import { addAddress } from './addressesActions'
import { HomeGameThunkDispatch, State } from '../state'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { SetAddress, SetAddressProps } from './SetAddress'

type SetAddressDispatchProps = Pick<SetAddressProps, 'showError' | 'setAddress'>
type SetAddressStateProps = Pick<SetAddressProps, 'address' | 'buttonLabel'>

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): SetAddressDispatchProps => ({
  showError: (error: string) => dispatch(showStatus(ErrorStatus(error))),
  setAddress: (address: Address) => dispatch(addAddress(address))
})

const newAddress: Address = {
  addressId: '',
  label: '',
  houseNumber: '',
  street: '',
  city: ''
}

const mapStateToProps = (state: State): SetAddressStateProps => ({
  address: newAddress,
  buttonLabel: 'Create'
})

export const AddAddress = connect(
  mapStateToProps,
  mapDispatchToProps
)(SetAddress)
