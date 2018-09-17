import * as React from 'react'
import { Component, ComponentType } from 'react'
import { Addresses } from './Addresses'
import { Address } from '../../db/types'
import { loadAddresses, markStale, markFresh } from './addressesActions'
import { connect } from 'react-redux'
import { State, HomeGameAction } from '../state'
import { getAddresses, getDataStatus } from './addressesReducer'
import { ThunkDispatch } from 'redux-thunk'
import { Services } from '../../services/services'
import { DataStatus } from '../../data/dataStatus'

namespace UI {
  export interface AddressesLoaderProps {
    readonly addresses: ReadonlyArray<Address>
    readonly dataStatus: DataStatus
    loadAddresses(): Promise<void>
    markStale(): void
    markFresh(): void
  }

  export class AddressesLoader extends Component<AddressesLoaderProps> {
    private mounted: boolean = false

    async componentDidMount() {
      this.mounted = true
      await this.props.loadAddresses()
      if (this.mounted) {
        this.props.markFresh()
      }
    }

    componentWillUnmount() {
      this.mounted = false
      this.props.markStale()
    }

    render() {
      return <Addresses addresses={this.props.addresses} dataStatus={this.props.dataStatus} />
    }
  }
}

type StateProps = Pick<UI.AddressesLoaderProps, 'addresses' | 'dataStatus'>
type DispatchProps = Pick<UI.AddressesLoaderProps, 'loadAddresses' | 'markStale' | 'markFresh'>

const mapStateToProps = (state: State): StateProps => ({
  addresses: getAddresses(state),
  dataStatus: getDataStatus(state)
})

const mapDispatchToProps = (dispatch: ThunkDispatch<State, Services, HomeGameAction>): DispatchProps => ({
  loadAddresses() {
    return dispatch(loadAddresses())
  },
  markStale() {
    dispatch(markStale())
  },
  markFresh() {
    dispatch(markFresh())
  }
})

export const AddressesLoader: ComponentType = connect(
  mapStateToProps,
  mapDispatchToProps
)(UI.AddressesLoader)
