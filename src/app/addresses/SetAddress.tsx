import * as React from 'react'
import { defaultTo } from 'lodash/fp'
import { ChangeEvent, SFC, Component } from 'react'
import { Address } from '../../db/types'
import { isEmpty, isEqual } from 'lodash/fp'
import { Form, FormGroup, Button, Input, Label, Jumbotron } from 'reactstrap'
import { Page } from '../../ui/Page'

export interface SetAddressStateProps {
  buttonLabel: string
  address?: Address
}

export interface SetAddressDispatchProps {
  setAddress: (address: Address) => void
  showError: (error: string) => void
}

type SetAddressProps = SetAddressStateProps & SetAddressDispatchProps

interface FormFieldProps { 
  id: string
  defaultValue: string
  type: 'text' | 'textarea'
  label: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const FormField: SFC<FormFieldProps> = ({ id, type, defaultValue, label, onChange }) =>
  <FormGroup>
    <Label for={id}>{label}</Label>
    <Input type={type} name={id} id={id} placeholder={label} defaultValue={defaultValue} onChange={onChange} />
  </FormGroup> 

export class SetAddress extends Component<SetAddressProps, Address> {
  state = {} as Address
  static getDerivedStateFromProps(props: SetAddressProps, state: Address) {
    if (!isEqual(state, {})) {
      return state
    }
    if (props.address) {
      return props.address
    }
    return state 
  } 

  change = (key: keyof Address) => (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    this.setState({ [key]: text } as Pick<Address, keyof Address>)
  }

  setAddress = () => {
    if (isEmpty(this.state.label) || isEmpty(this.state.houseNumber) || isEmpty(this.state.street) || isEmpty(this.state.city)) {
      this.props.showError('Fill in the address details')
    }
    else {
      this.props.setAddress(this.state)
    }
  }

  render() {
    if (!this.props.address) {
      return 'Loading'
    }
    return (
      <Page>
        <Jumbotron>
          <Form color='primary'>
            <FormField id="label" label="Label" type="text" defaultValue={this.state.label} onChange={this.change('label')} />
            <FormField id="number" label="House Number" type="text" defaultValue={this.state.houseNumber} onChange={this.change('houseNumber')} />
            <FormField id="street" label="Street" type="text" defaultValue={this.state.street} onChange={this.change('street')}/>
            <FormField id="city" label="City" type="text" defaultValue={this.state.city} onChange={this.change('city')}/>
            <FormField id="notes" label="Notes" type="textarea" defaultValue={defaultTo('', this.state.notes)} onChange={this.change('notes')}/>
            <Button color="primary" onClick={this.setAddress}>{this.props.buttonLabel}</Button>
          </Form>
        </Jumbotron>
      </Page>
    )
  }
}
