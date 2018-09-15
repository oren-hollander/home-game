import * as React from 'react'
import { Component, ComponentType } from 'react'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Action } from 'redux'
import { connect } from 'react-redux'
import { ParametricSelector } from 'reselect'
import { Maybe } from '../util/maybe'

export type FreshData<T> = {
  type: 'fresh'
  value: Maybe<T>
}

export type StaleData<T> = {
  type: 'stale'
  value: Maybe<T>
}

export const FreshData = <T extends any>(value: Maybe<T>): FreshData<T> => ({ type: 'fresh', value })
export const StaleData = <T extends any>(value: Maybe<T>): StaleData<T> => ({ type: 'stale', value })

export type Result<T> = FreshData<Maybe<T>> | StaleData<Maybe<T>>

export type LoadData<Param, Data, S, E, A extends Action> = (param: Param) => ThunkAction<Promise<Maybe<Data>>, S, E, A>

export type StoreData<Data, A extends Action> = (data: Maybe<Data>) => A

export const withData = <Param, Data, CompProps, ConnectorOwnProps, S, E, A extends Action>(
  loadData: LoadData<Param, Data, S, E, A>,
  storeData: StoreData<Maybe<Data>, A>,
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
      this.mounted = true
      const param = mapPropsToParam(this.props)
      const data = await this.props.loadData(param)
      this.props.storeData(data)
    }

    getResultData = (): Result<Maybe<Data>> => (this.mounted ? FreshData(this.props.data) : StaleData(this.props.data))

    render() {
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

// namespace test {
//   type CompProps = {
//     a: string
//     b: number
//     f(): void
//   }

//   type Comp = SFC<CompProps>

//   const Comp: Comp = ({ a, b, f }) => (
//     <div onClick={f}>
//       {a} {b}
//     </div>
//   )

//   /////////////////////////

//   type CompStateProps = {
//     a: string
//   }

//   type CompDispatchProps = {
//     f(): void
//   }

//   type CompOwnProps = {
//     b: number
//   }

//   type ConnectorOwnProps = {
//     id: string
//   }

//   type Connector = ComponentType<ConnectorOwnProps & CompOwnProps>
//   type State = {}

//   const mstp = (state: State, ownProps: ConnectorOwnProps): CompStateProps => ({ a: 'a' })
//   const mdtp = (dispatch: ThunkDispatch<State, {}, Action>, ownProps: ConnectorOwnProps): CompDispatchProps => ({
//     f: () => null
//   })

//   const Connector: Connector = connect<CompStateProps, CompDispatchProps, ConnectorOwnProps, State>(
//     mstp,
//     mdtp
//   )(Comp)

//   const x = <Connector id="a" b={1} />
//   console.log(x)
// }
