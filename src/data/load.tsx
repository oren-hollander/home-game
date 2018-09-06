import * as React from 'react'
import { Component, ComponentType } from 'react'
import { connect } from 'react-redux'
import { State, HomeGameThunkDispatch, HomeGameAction } from '../app/state'
import { ThunkAction } from 'redux-thunk';
import { Services } from '../services/services'

type LoadData = () => ThunkAction<Promise<void>, State, Services, HomeGameAction>

export const load = <T extends any>(loadData: LoadData) => (Comp: ComponentType<T>): ComponentType<T> => {
  interface LoadProps {
    load: () => void
  }

  class Load extends Component<LoadProps> {
    componentDidMount() {
      this.props.load()
    }

    render() {
      return <Comp {...this.props}/>
    }
  }

  const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): LoadProps => ({
    load: () => dispatch(loadData())
  })

  return connect(undefined, mapDispatchToProps)(Load) as {} as ComponentType<T>
}