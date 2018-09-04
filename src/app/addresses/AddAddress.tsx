import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField/TextField'
import Button from '@material-ui/core/es/Button'
import { Address } from '../../db/types'
import { addAddress } from './addressesActions'
import { HomeGameThunkDispatch } from '../state'
import { isEmpty } from 'lodash/fp'
import { showError } from '../status/statusActions'

interface AddAddressDispatchProps {
  addAddress: (address: Address) => void
  showError: (error: string) => void
}

class AddAddressComponent extends Component<AddAddressDispatchProps, Address> {
  state: Address =  {
    addressId: '',
    label: '',
    houseNumber: '',
    street: '',
    city: '',
    notes: ''
  }

  change = (key: keyof Address) => (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({[key]: event.target.value} as Pick<Address, keyof Address>)
  }

  setAddress = () => {
    if (isEmpty(this.state.label) || isEmpty(this.state.houseNumber) || isEmpty(this.state.street) || isEmpty(this.state.city)) {
      this.props.showError('Fill in the address details')
    }
    else {
      this.props.addAddress(this.state)
    }
  }

  render() {
    return (
      <div>
        <TextField margin='normal' label='Address label' onChange={this.change('label')}/>
        <TextField margin='normal' label='House Number' onChange={this.change('houseNumber')}/>
        <TextField margin='normal' label='Street' onChange={this.change('street')}/>
        <TextField margin='normal' label='City' onChange={this.change('city')}/>
        <TextField margin='normal' label='Notes' onChange={this.change('notes')}/>
        <Button variant="contained" color="primary" onClick={this.setAddress}>Update</Button>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): AddAddressDispatchProps => ({
  showError: (error: string) => dispatch(showError(error)),
  addAddress: (address: Address) => dispatch(addAddress(address))
})

export const AddAddress = connect(undefined, mapDispatchToProps)(AddAddressComponent)