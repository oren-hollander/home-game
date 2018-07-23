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
import {hasAddress} from '../users/usersReducer'
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
  hasAddress: boolean
}

type StateKey = keyof NewGameState

// type AddressComponentProps = {
//   value: Address,
//   onChange: (address: Address) => void
// }

// class AddressEditor extends Component<AddressComponentProps, Address> {
//   state: Address = {
//     houseNumber: '',
//     street: '',
//     city: '',
//     notes: ''
//   }
//
//   change = (key: keyof Address) => (event: ChangeEvent<HTMLInputElement>) => {
//     this.setState({[key]: event.target.value} as {}, () => {
//       this.props.onChange(this.state)
//     })
//   }
//
//   render() {
//     return (
//       <Fragment>
//         <TextField margin='normal' label='House Number' onChange={this.change('houseNumber')}/>
//         <TextField margin='normal' label='Street' />
//         <TextField margin='normal' label='City' />
//         <TextField margin='normal' label='Notes' onChange={this.change('notes')}/>
//       </Fragment>
//     )
//   }
// }

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

  // setAddress = (address: Address) => {
  //   this.setState({address})
  // }

  render() {
    if(!this.props.hasAddress) {
      return <div>
        You must hav an address
        <Button variant="contained" color="primary">
          <Link to="/address">Edit Address</Link>
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
  hasAddress: hasAddress(state)
})

export const NewGame = connect(mapStateToProps)(NewGameComponent)
