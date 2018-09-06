import { connect } from 'react-redux'
import { Address } from '../../db/types'
import { addAddress } from './addressesActions'
import { HomeGameThunkDispatch, State } from '../state'
import { showError } from '../status/statusActions'
import { SetAddress, SetAddressDispatchProps, SetAddressStateProps } from './SetAddress'

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): SetAddressDispatchProps => ({
  showError: (error: string) => dispatch(showError(error)),
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

export const AddAddress = connect(mapStateToProps, mapDispatchToProps)(SetAddress)