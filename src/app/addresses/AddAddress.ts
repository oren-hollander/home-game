import { connect } from 'react-redux'
import { Address } from '../../db/types'
import { addAddress } from './addressesActions'
import { HomeGameThunkDispatch } from '../state'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { SetAddress, SetAddressProps } from './SetAddress'
import { compose, withProps } from 'recompose'
import { constant } from 'lodash/fp'

type SetAddressDispatchProps = Pick<SetAddressProps, 'showError' | 'setAddress'>

const addAddressProps = {
  address: {
    addressId: '',
    label: '',
    houseNumber: '',
    street: '',
    city: ''
  },
  buttonLabel: 'Create'
}

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): SetAddressDispatchProps => ({
  showError: (error: string) => dispatch(showStatus(ErrorStatus(error))),
  setAddress: (address: Address) => dispatch(addAddress(address))
})

export const AddAddress = compose(
  connect(
    undefined,
    mapDispatchToProps
  ),
  withProps(constant(addAddressProps))
)(SetAddress)
