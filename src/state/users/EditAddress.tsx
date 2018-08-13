import * as React from 'react'
import {ChangeEvent, Component} from 'react'
import {connect, MapDispatchToProps, MapStateToProps} from 'react-redux'
import TextField from '@material-ui/core/TextField/TextField'
import Button from '@material-ui/core/es/Button'
import {State} from '../index'
import {Address} from '../../model/types'
import {getAddress} from './usersReducer'
import {updateAddress} from './usersActions'

interface EditAddressStateProps {
  address: Address | null
}

interface EditAddressDispatchProps {
  setAddress: (address: Address) => void
}

type EditAddressProps = EditAddressStateProps & EditAddressDispatchProps

class EditAddressComponent extends Component<EditAddressProps, Address> {
  state: Address = this.props.address ? this.props.address : {
    houseNumber: '',
    street: '',
    city: '',
    notes: ''
  }

  change = (key: keyof Address) => (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({[key]: event.target.value} as Pick<Address, keyof Address>)
  }

  setAddress = () => {
    this.props.setAddress(this.state)
  }

  render() {
    return (
      <div>
        <TextField margin='normal' label='House Number' onChange={this.change('houseNumber')}/>
        <TextField margin='normal' label='Street' onChange={this.change('street')}/>
        <TextField margin='normal' label='City' onChange={this.change('city')}/>
        <TextField margin='normal' label='Notes' onChange={this.change('notes')}/>
        <Button variant="contained" color="primary" onClick={this.setAddress}>Update</Button>
      </div>
    )
  }
}

const mapStateToProps: MapStateToProps<EditAddressStateProps, {}, State> = state => ({
  address: getAddress(state)
})

const mapDispatchToProps: MapDispatchToProps<EditAddressDispatchProps, {}> = dispatch => ({
  setAddress: (address: Address) => dispatch(updateAddress(address))
})


export const EditAddress = connect(mapStateToProps, mapDispatchToProps)(EditAddressComponent)