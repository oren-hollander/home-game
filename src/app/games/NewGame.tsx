import * as React from 'react'
import { ChangeEvent, Component, SFC } from 'react'
import { Address } from '../../db/types'
import { load } from '../../data/load'
import { loadAddresses } from '../addresses/addressesActions'
import { getAddresses } from '../addresses/addressesReducer'
import { isEmpty, defaultTo, map, find, head, isUndefined } from 'lodash/fp'
import { State, HomeGameThunkDispatch } from '../state'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { AddressRequired } from './AddressRequired'
import { Page } from '../../ui/Page'
import { Form, FormGroup, Button, Input, Label, Jumbotron } from 'reactstrap'
import { createGame } from '../games/gamesActions'
import * as firebase from 'firebase/app'
import DateTime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { Moment } from 'moment'
import { isString } from 'util'
import { showStatus, WarningStatus, ErrorStatus } from '../status/statusActions'
import { StatusMessage } from '../status/statusReducer'

type Timestamp = firebase.firestore.Timestamp
const Timestamp = firebase.firestore.Timestamp

interface NewGameState {
  readonly addressId?: string
  readonly timestamp?: Timestamp
  readonly description?: string
}

interface NewGameStateProps {
  readonly addresses: ReadonlyArray<Address>
}

interface NewGameDispatchProps {
  createGame(timestamp: Timestamp, address: Address, description: string): void
  showStatus(statis: StatusMessage): void
}

type NewGameProps = NewGameStateProps & NewGameDispatchProps

namespace UI {
  interface FormFieldProps {
    id: string
    defaultValue: string
    type: 'text' | 'textarea'
    label: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
  }

  const FormField: SFC<FormFieldProps> = ({ id, type, defaultValue, label, onChange }) => (
    <FormGroup>
      <Label for={id}>{label}</Label>
      <Input
        type={type}
        style={{ resize: 'none' }}
        name={id}
        id={id}
        placeholder={label}
        defaultValue={defaultValue}
        onChange={onChange}
      />
    </FormGroup>
  )

  export class NewGame extends Component<NewGameProps, NewGameState> {
    state: NewGameState = {}

    static getDerivedStateFromProps(props: NewGameProps, state: NewGameState): Partial<NewGameState> {
      if (!isEmpty(props.addresses)) {
        return {
          addressId: head(props.addresses)!.addressId
        }
      }

      return {}
    }

    setText = (key: keyof NewGameState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      this.setState({ [key]: event.target.value } as {})
    }

    updateAddress = (e: ChangeEvent<HTMLSelectElement>) => {
      this.setState({ addressId: e.target.value })
    }

    updateStartTime = (dateTime: string | Moment) => {
      if (isString(dateTime)) {
        this.setState({
          timestamp: undefined
        })
        this.props.showStatus(WarningStatus('Invalid date format'))
      } else {
        const moment = dateTime as Moment
        this.setState({
          timestamp: Timestamp.fromDate(moment.toDate())
        })
      }
    }

    getAddress = (): Address => find(address => address.addressId === this.state.addressId, this.props.addresses)!

    createGame = () => {
      if (
        isUndefined(this.state.addressId) ||
        isUndefined(this.state.timestamp) ||
        isUndefined(this.state.description)
      ) {
        this.props.showStatus(ErrorStatus('Fill all the details'))
      } else {
        this.props.createGame(this.state.timestamp!, this.getAddress(), this.state.description!)
      }
    }

    render() {
      if (isEmpty(this.props.addresses)) {
        return <AddressRequired />
      }
      return (
        <Page>
          <Jumbotron>
            <Form color="primary">
              <FormGroup>
                <Label for="startTime">Time</Label>
                <DateTime id="startTime" onChange={this.updateStartTime} />
              </FormGroup>
              <FormField
                id="description"
                label="Description"
                type="textarea"
                defaultValue={defaultTo('', this.state.description)}
                onChange={this.setText('description')}
              />
              <FormGroup>
                <Label for="address">Address</Label>
                <Input type="select" name="address" id="address" onChange={this.setText('addressId')}>
                  {map(
                    address => (
                      <option key={address.addressId} value={address.addressId}>
                        {address.label}
                      </option>
                    ),
                    this.props.addresses
                  )}
                </Input>
              </FormGroup>
              <Button color="primary" onClick={this.createGame}>
                Create
              </Button>
            </Form>
          </Jumbotron>
        </Page>
      )
    }
  }
}

const mapStateToProps = (state: State): NewGameStateProps => ({
  addresses: getAddresses(state)
})

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): NewGameDispatchProps => ({
  createGame(timestamp: Timestamp, address: Address, description: string) {
    dispatch(createGame(timestamp, address, description))
  },
  showStatus(status: StatusMessage) {
    dispatch(showStatus(status))
  }
})

export const NewGame = compose(
  load(loadAddresses),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(UI.NewGame)
