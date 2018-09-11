import * as React from 'react'
import { Component, ComponentType } from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import { HomeGameThunkDispatch, State, HomeGameAction } from '../app/state'
import { ThunkAction } from 'redux-thunk'
import { Services } from '../services/services'

type EmptyDataResult = {
  type: 'empty'
}

type PendingDataResult = {
  type: 'pendnig'
}

type DataResult<T> = {
  type: 'data'
  data: T
}

type Result<T> = DataResult<T> | PendingDataResult | EmptyDataResult

type DataLoader<P, T> = (props: P) => ThunkAction<Promise<Result<T>>, State, Services, HomeGameAction> 

export const withData = <P, T>(loader: DataLoader<P, T>) => (Comp: ComponentType): ComponentType<P> => {
  
  type DispatchProps<P, T> = {
    loader: () => Promise<Result<T>>
  }

  class WithData extends Component<DispatchProps<P, T>> {
    async componentDidMount() {
      const result = await this.props.loader()
      switch(result.type) {
        case 'empty'
      }
    }
    render() {
      return <Comp {...this.props} />
    }
  }

  
  const mapDispatchToProps: MapDispatchToProps<DispatchProps<P, T>, P> = (dispatch: HomeGameThunkDispatch, ownProps): DispatchProps<P, T> => ({
    loader: () => dispatch(loader(ownProps))
  })

  return connect(undefined, mapDispatchToProps)(WithData)
}