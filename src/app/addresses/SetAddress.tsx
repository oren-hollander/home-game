import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { Address } from '../../db/types'
import { isEmpty } from 'lodash/fp'

export interface SetAddressStateProps {
  buttonLabel: string
  address: Address
}

export interface SetAddressDispatchProps {
  setAddress: (address: Address) => void
  showError: (error: string) => void
}

type SetAddressProps = SetAddressStateProps & SetAddressDispatchProps

const emptyAddress: Address = {
  addressId: '',
  city: '',
  houseNumber:'',
  label: '',
  street: ''
}

export class SetAddress extends Component<SetAddressProps, Address> {
  state: Address = emptyAddress
  static getDerivedStateFromProps(props: SetAddressProps, state: Address) {
    return props.address ? props.address : emptyAddress
  } 

  change = (key: keyof Address) => (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    this.setState({ label: text } as Pick<Address, keyof Address>, () => {
      console.log('change', key, text, this.state)
    })
  }

  setAddress = () => {
    if (isEmpty(this.state.label) || isEmpty(this.state.houseNumber) || isEmpty(this.state.street) || isEmpty(this.state.city)) {
      this.props.showError('Fill in the address details')
    }
    else {
      console.log('set', this.state)

      this.props.setAddress(this.state)
    }
  }

  render() {
    if (this.state === emptyAddress) {
      return 'Loading'
    }
    return (
      <div>
        <input defaultValue={this.state.label} placeholder="Label" onChange={this.change('label')} />
        <input defaultValue={this.state.houseNumber} placeholder="Number" onChange={this.change('houseNumber')} />
        <input defaultValue={this.state.street} placeholder="Street" onChange={this.change('street')} />
        <input defaultValue={this.state.city} placeholder="City" onChange={this.change('city')} />
        <input defaultValue={this.state.notes} placeholder="Notes" onChange={this.change('notes')} />
        <button onClick={this.setAddress}>{this.props.buttonLabel}</button>
      </div>
    )
  }
}
