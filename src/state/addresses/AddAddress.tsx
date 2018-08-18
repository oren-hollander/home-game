import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import TextField from '@material-ui/core/TextField/TextField'
import Button from '@material-ui/core/es/Button'
import { Address } from '../../model/types'
import { addAddress } from './addressesActions'

interface AddAddressDispatchProps {
  addAddress: (address: Address) => void
}

class AddAddressComponent extends Component<AddAddressDispatchProps, Address> {
  state: Address =  {
    addressId: '',
    houseNumber: '',
    street: '',
    city: '',
    notes: ''
  }

  change = (key: keyof Address) => (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({[key]: event.target.value} as Pick<Address, keyof Address>)
  }

  setAddress = () => {
    if(this.state.addressId !== '')
      this.props.addAddress(this.state)
  }

  render() {
    return (
      <div>
        <TextField margin='normal' label='Address label' onChange={this.change('addressId')}/>
        <TextField margin='normal' label='House Number' onChange={this.change('houseNumber')}/>
        <TextField margin='normal' label='Street' onChange={this.change('street')}/>
        <TextField margin='normal' label='City' onChange={this.change('city')}/>
        <TextField margin='normal' label='Notes' onChange={this.change('notes')}/>
        <Button variant="contained" color="primary" onClick={this.setAddress}>Update</Button>
      </div>
    )
  }
}

const mapDispatchToProps: MapDispatchToProps<AddAddressDispatchProps, {}> = dispatch => ({
  addAddress: (address: Address) => dispatch(addAddress(address))
})

export const AddAddress = connect(undefined, mapDispatchToProps)(AddAddressComponent)