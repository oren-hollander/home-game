import * as React from 'react'
import { Component, ComponentType } from 'react'
import { ThunkDispatch, ThunkAction } from 'redux-thunk'
import { connect } from 'react-redux'
import { DataStatus } from './dataStatus'
import { State, HomeGameAction } from '../app/state'
import { Services } from '../services/services'
import { ParametricSelector } from 'reselect'
import { noop } from 'lodash/fp'

export interface CompProps<T> {
  data: T
  dataStatus: DataStatus
}

export type Unsubscribe = () => void

export const dataLoader = <T, P, OwnProps>(
  propsToParam: (props: OwnProps) => P,
  loadData: (param: P) => ThunkAction<Promise<Unsubscribe>, State, Services, HomeGameAction>,
  markStale: HomeGameAction,
  markFresh: HomeGameAction,
  getData: ParametricSelector<State, P, T>,
  getDataStatus: ParametricSelector<State, P, DataStatus>,
) => (Comp: ComponentType<CompProps<T>>): ComponentType<OwnProps> => {
  interface DataLoaderProps {
    readonly data: T
    readonly dataStatus: DataStatus
    loadData(): Promise<Unsubscribe>
    markStale(): void
    markFresh(): void
  }

  class DataLoader extends Component<DataLoaderProps> {
    private mounted: boolean = false
    private unsubscribe: () => void = noop

    async componentDidMount() {
      this.mounted = true
      this.unsubscribe = await this.props.loadData()
      if (this.mounted) {
        this.props.markFresh()
      }
    }

    componentWillUnmount() {
      this.mounted = false
      this.props.markStale()
      this.unsubscribe()
    }

    render() {
      debugger
      return <Comp data={this.props.data} dataStatus={this.props.dataStatus} />
    }
  }

  type StateProps = Pick<DataLoaderProps, 'data' | 'dataStatus'>
  type DispatchProps = Pick<DataLoaderProps, 'loadData' | 'markStale' | 'markFresh'>

  const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => ({
    data: getData(state, propsToParam(ownProps)),
    dataStatus: getDataStatus(state, propsToParam(ownProps))
  })

  const mapDispatchToProps = (
    dispatch: ThunkDispatch<State, Services, HomeGameAction>,
    ownProps: OwnProps
  ): DispatchProps => ({
    loadData() {
      return dispatch(loadData(propsToParam(ownProps)))
    },
    markStale() {
      dispatch(markStale)
    },
    markFresh() {
      dispatch(markFresh)
    }
  })

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(DataLoader)
}
