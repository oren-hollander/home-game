import * as React from 'react'
import { Component, ComponentType } from 'react'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Action } from 'redux'
import { connect } from 'react-redux'
import { ParametricSelector } from 'reselect'

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

export type StaleDataResult<T> = {
  type: 'stale'
  value: T
}

export const DataResult = <T extends any>(value: T): DataResult<T> => ({ type: 'data', value })
export const EmptyDataResult: EmptyDataResult = { type: 'empty' }
export const PendingDataResult: PendingDataResult = { type: 'pending' }

export type Result<T> = DataResult<T> | StaleDataResult<T> | PendingDataResult | EmptyDataResult

export type LoadData<Param, Data, S, E, A extends Action> = (param: Param) => ThunkAction<Promise<Result<Data>>, S, E, A>

export const withData = <Param, Data, Props, WrapperProps, S, E, A extends Action>(loadData: LoadData<Param, Data, S, E, A>, selectData: ParametricSelector<S, WrapperProps, Data>, mapProps: (props: WrapperProps) => Param, mapResult: (result: Result<Data>) => Props, Comp: ComponentType<Props>): ComponentType<WrapperProps> => {

  type WithDataState = {
    result: Result<Data>
  }

  type WithDataDispatchProps = {
    loadData(param: Param): Promise<Result<Data>>
  }

  type WithDataStateProps = {
    data: Result<Data>
  }

  type WithDataProps = WithDataStateProps & WithDataDispatchProps & WrapperProps

  class WithData extends Component<WithDataProps, WithDataState> {
    state: WithDataState = {
      result: PendingDataResult
    }

    async componentDidMount() {
      const param = mapProps(this.props as Readonly<WrapperProps>)
      const result = await this.props.loadData(param)
      this.setState({ result })
    }

    render() {
      const props: Props = mapResult(this.state.result)
      return <Comp {...this.props} {...props} />
    }
  } 

  const mapDispatchToProps = (dispatch: ThunkDispatch<S, E, A>): WithDataDispatchProps => ({
    async loadData(param: Param): Promise<Result<Data>> {
      return dispatch(loadData(param))
    }
  })

  const mapStateToProps = (state: S, ownProps: WrapperProps): WithDataStateProps => ({
    data: DataResult(selectData(state, ownProps))
  })

  return connect<WithDataStateProps, WithDataDispatchProps, WrapperProps>(mapStateToProps, mapDispatchToProps)(WithData) 
}