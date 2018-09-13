import * as React from 'react'
import { Component, ComponentType } from 'react'
// import { connect, MapDispatchToProps } from 'react-redux'
// import { HomeGameThunkDispatch, State, HomeGameAction } from '../app/state'
// import { ThunkAction } from 'redux-thunk'
// import { Services } from '../services/services'

export type EmptyDataResult = {
  type: 'empty'
}

export type PendingDataResult = {
  type: 'pending'
}

export type DataResult<T> = {
  type: 'data'
  value: T
}

export const DataResult = <T extends any>(value: T): DataResult<T> => ({ type: 'data', value })
export const EmptyDataResult: EmptyDataResult = { type: 'empty' }
export const PendingDataResult: PendingDataResult = { type: 'pending' }

export type Result<T> = DataResult<T> | PendingDataResult | EmptyDataResult

export type LoadData<Param, Data> = (param: Param) => Promise<Result<Data>>

export const withData = <Param, Data, Props, WrapperProps>(loadData: LoadData<Param, Data>, mapProps: (props: WrapperProps) => Param, mapResult: (result: Result<Data>) => Props, Comp: ComponentType<Props>): ComponentType<WrapperProps> => {

  type WithDataState = {
    result: Result<Data>
  }

  class WithData extends Component<WrapperProps, WithDataState> {
    state: WithDataState = {
      result: PendingDataResult
    }

    async componentDidMount() {
      const param = mapProps(this.props)
      const result = await loadData(param)
      this.setState({ result })
    }

    render() {
      const props: Props = mapResult(this.state.result)
      return <Comp {...this.props} {...props} />
    }
  } 

  return WithData
}


// type LoadData<P, T> = (props: P) => ThunkAction<Promise<Result<T>>, State, Services, HomeGameAction> 

// export const withData = <P, PP, D>(loader: DataLoader<P, D>) => (Comp: ComponentType<PP>): ComponentType<P> => {
  
//   type DispatchProps<P, T> = {
//     loader: () => Promise<Result<T>>
//   }

//   class WithData extends Component<DispatchProps<P, T>> {
//     async componentDidMount() {
//       const result = await this.props.loader()
//       switch(result.type) {
//         case 'empty'
//       }
//     }
//     render() {
//       return <Comp {...this.props} />
//     }
//   }

  
//   const mapDispatchToProps: MapDispatchToProps<DispatchProps<P, T>, P> = (dispatch: HomeGameThunkDispatch, ownProps): DispatchProps<P, T> => ({
//     loader: () => dispatch(loader(ownProps))
//   })

//   return connect(undefined, mapDispatchToProps)(WithData)
// }