import * as React from 'react'
import {ChangeEvent, Component} from 'react'
import {connect, MapStateToProps} from 'react-redux'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl/FormControl'
import InputLabel from '@material-ui/core/InputLabel/InputLabel'
import Select from '@material-ui/core/Select/Select'
import MenuItem from '@material-ui/core/MenuItem/MenuItem'
import {GameType} from '../../model/types'
import TextField from '@material-ui/core/TextField/TextField'
import Button from '@material-ui/core/es/Button'
import {getAddressCount} from '../addresses/addressesReducer'
import {State} from '../index'
import {Link} from 'react-router-dom'

interface NewGameState {
  gameType: GameType,
  maxPlayers: number,
  smallBlind: number,
  bigBlind: number,
  dateTime: string,
  notes: string
}

interface NewGameProps {
  addressCount: number
}

type StateKey = keyof NewGameState

export class NewGameComponent extends Component<NewGameProps, NewGameState> {
  state: NewGameState = {
    gameType: 'PLO' as GameType,
    maxPlayers:  9,
    smallBlind: 1,
    bigBlind: 2,
    dateTime: '2017-05-24T10:30',
    notes: ''
  }

  setText = (key: keyof NewGameState) => (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      this.setState({[key]: event.target.value} as {})
    }

  setNumber = (key: StateKey) => (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    this.setState({[key]: Number.parseInt(event.target.value)} as {})
  }

  render() {
    if (this.props.addressCount === 0) {
      return <div>
        You must have an address
        <Button variant="contained" color="primary">
          <Link to="/address">Add Address</Link>
        </Button>
      </div>
    }
    return (
      <div>
        <Typography variant="title" color="inherit">New Game</Typography>
        <form autoComplete="off">
          <FormControl style={{minWidth: 120}}>
            <InputLabel htmlFor='game-type'>Game Type</InputLabel>
            <Select value={this.state.gameType} onChange={this.setText('gameType')} inputProps={{name: 'gameType', id: 'game-type'}}>
              <MenuItem value='NLH'>NLH</MenuItem>
              <MenuItem value='PLO'>PLO</MenuItem>
            </Select>
          </FormControl>

          <TextField margin='normal' label='Small Blind' type='number' value={this.state.smallBlind} onChange={this.setNumber('smallBlind')}/>
          <TextField margin='normal' label='Big Blind' type='number' value={this.state.bigBlind} onChange={this.setNumber('bigBlind')}/>
          <TextField margin='normal' label='When' type='datetime-local' value={this.state.dateTime} onChange={this.setText('dateTime')}/>
          <TextField margin='normal' label='Max Players' type='number' value={this.state.maxPlayers} onChange={this.setNumber('maxPlayers')}/>
          {/*<AddressEditor value={this.state.address} onChange={this.setAddress}/>*/}
          <TextField margin='normal' multiline={true} label='Notes' rows='4' value={this.state.notes} onChange={this.setText('notes')}/>
        </form>
      </div>
    )
  }
}

const mapStateToProps: MapStateToProps<NewGameProps, {}, State> = state => ({
  addressCount: getAddressCount(state)
})

export const NewGame = connect(mapStateToProps)(NewGameComponent)
