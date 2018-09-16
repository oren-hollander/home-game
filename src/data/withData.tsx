import * as React from 'react'
import { Component, ComponentType } from 'react'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Action } from 'redux'
import { connect } from 'react-redux'
import { ParametricSelector } from 'reselect'
import { Maybe } from '../util/maybe'

export type FreshData<T> = {
  type: 'fresh'
  value: T
}

export type StaleData<T> = {
  type: 'stale'
  value: T
}

export const FreshData = <T extends any>(value: T): FreshData<T> => ({ type: 'fresh', value })
export const StaleData = <T extends any>(value: T): StaleData<T> => ({ type: 'stale', value })

export type Result<T> = FreshData<T> | StaleData<T>

export type LoadData<Param, Data, S, E, A extends Action> = (param: Param) => ThunkAction<Promise<Maybe<Data>>, S, E, A>

export type StoreData<Data, A extends Action> = (data: Maybe<Data>) => A

export const withData = <Param, Data, CompProps, ConnectorOwnProps, S, E, A extends Action>(
  loadData: LoadData<Param, Data, S, E, A>,
  storeData: StoreData<Data, A>,
  selectData: ParametricSelector<S, ConnectorOwnProps, Maybe<Data>>,
  mapPropsToParam: (props: Readonly<ConnectorOwnProps>) => Param,
  mapResultToProps: (result: Result<Maybe<Data>>) => CompProps,
  Comp: ComponentType<CompProps>
): ComponentType<ConnectorOwnProps> => {
  type StateProps = {
    data: Maybe<Data>
  }

  type DispatchProps = {
    loadData(param: Param): Promise<Maybe<Data>>
    storeData(data: Maybe<Data>): void
  }

  class WithData extends Component<StateProps & DispatchProps & ConnectorOwnProps> {
    mounted: boolean = false

    async componentDidMount() {
      console.log('mounted')
      this.mounted = true
      const param = mapPropsToParam(this.props)
      const data = await this.props.loadData(param)
      console.log('data', data)
      this.props.storeData(data)
    }

    getResultData = (): Result<Maybe<Data>> => {
      return (this.mounted ? FreshData(this.props.data) : StaleData(this.props.data))
    }
    render() {
      console.log('render')
      const result = this.getResultData()
      const props: CompProps = mapResultToProps(result)
      return <Comp {...this.props} {...props} />
    }
  }

  const mapDispatchToProps = (dispatch: ThunkDispatch<S, E, A>): DispatchProps => ({
    async loadData(param: Param): Promise<Maybe<Data>> {
      return dispatch(loadData(param))
    },
    storeData(data: Maybe<Data>): void {
      dispatch(storeData(data))
    }
  })

  const mapStateToProps = (state: S, ownProps: ConnectorOwnProps): StateProps => ({
    data: selectData(state, ownProps)
  })

  type Connector = ComponentType<ConnectorOwnProps>

  const Connector: Connector = connect<StateProps, DispatchProps, ConnectorOwnProps, S>(
    mapStateToProps,
    mapDispatchToProps
  )(WithData as any)

  return Connector
}