import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import Typography from '@material-ui/core/Typography'
import { Address, Game } from '../../db/types'
import TextField from '@material-ui/core/TextField/TextField'
import { Link } from 'react-router-dom'
import { load } from '../../data/load'
import { loadAddresses } from '../addresses/addressesActions'
import { getAddresses } from '../addresses/addressesReducer'
import { isEmpty, map, head } from 'lodash/fp'
import { State } from '../state'
import { connect } from 'react-redux'
import { compose } from 'recompose'

interface NewGameState {
  readonly addressId?: string
  readonly startTime?: string
  readonly description?: string
}

interface NewGameProps {
  addresses: ReadonlyArray<Address>
}

type StateKey = keyof Game

namespace UI {
  export class NewGame extends Component<NewGameProps, NewGameState> {
    state: NewGameState = {
      addressId: isEmpty(this.props.addresses) ? '' : head(this.props.addresses)!.addressId
    }

    setText = (key: keyof NewGameState) => (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      this.setState({ [key]: event.target.value } as {})
    }

    setNumber = (key: StateKey) => (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      this.setState({ [key]: Number.parseInt(event.target.value) } as {})
    }

    updateAddress = (e: ChangeEvent<HTMLSelectElement>) => {
      console.log(e.target.value)
      // this.setState({addressId: e.target.selectedIndex })
    }

    render() {
      if (isEmpty(this.props.addresses)) {
        return <div>
          <p>You must have an address</p>
          <Link to="/addresses">Add Address</Link>
        </div>
      }
      return (
        <div>
          <Typography variant="title" color="inherit">New Game</Typography>
          <form autoComplete="off">
            <TextField margin='normal' label='Start Time' type='text' onChange={this.setText('startTime')} />
            <TextField margin='normal' multiline={true} label='Notes' rows='4' onChange={this.setText('description')} />
            <label>
              Address
            <select onChange={this.updateAddress}>
                {map(address => <option value={address.addressId} key={address.addressId}>{address.label}</option>, this.props.addresses)}
              </select>
            </label>
          </form>
        </div>
      )
    }
  }
}

const mapStateToProps = (state: State): NewGameProps => ({
  addresses: getAddresses(state)
})
export const NewGame = compose(
  load(loadAddresses),
  connect(mapStateToProps)
)(UI.NewGame)
