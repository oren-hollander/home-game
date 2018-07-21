import * as React from 'react'
import {Component} from 'react'
import {Address} from '../../model/types'
import {State} from '../index'
import {connect, MapDispatchToProps, MapStateToProps} from 'react-redux'
import {getAddress} from './usersReducer'
import {setAddress} from './usersActions'

interface EditAddressStateProps {
  address: Address | null
}

interface EditAddressDispatchProps {
  setAddress: (address: Address) => void
}

type EditAddressProps = EditAddressStateProps & EditAddressDispatchProps

class EditAddressComponent extends Component<EditAddressProps> {
  render() {
    return <div/>
  }
}

const mapStateToProps: MapStateToProps<EditAddressStateProps, never, State> = state => ({
  address: getAddress(state)
})

const mapDispatchToProps: MapDispatchToProps<EditAddressDispatchProps, never> = dispatch => ({
  setAddress: (address: Address) => dispatch(setAddress(address))
})


export const EditAddress = connect(mapStateToProps, mapDispatchToProps)(EditAddressComponent)