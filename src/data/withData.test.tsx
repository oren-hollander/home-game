import * as React from 'react'
import { SFC, ComponentType } from 'react' 
import { withData, LoadData, Result, DataResult, PendingDataResult } from './withData'
import { toNumber } from 'lodash/fp'
import { SettlingPromise, promiseChain } from '../util/promise'
import { render } from '../util/render'
import { createStore, applyMiddleware, Reducer } from 'redux'
import { Provider } from 'react-redux'
import * as thunk from 'redux-thunk'
import { Selector, ParametricSelector } from 'reselect'
import { produce } from 'immer'

describe('withData', () => {
  const firstRenderPromise = SettlingPromise<Result<number>>()
  const secondRenderPromise = SettlingPromise<Result<number>>()
  const promises = promiseChain(firstRenderPromise, secondRenderPromise)

  type State = {
    readonly [key: string]: number
  }

  type SetNumber = {
    type: 'set-action'
    key: string
    value: number
  }

  type UnsetNumber = {
    type: 'unset-number'
    key: 'string'
  }

  type Action = SetNumber | UnsetNumber

  const reducer: Reducer<State, Action> = (state = {}, action) => {
    switch (action.type) {
      case 'set-action': 
        return produce(state, draft => {
          draft[action.key] = action.value
        }) 
      case 'unset-number': 
        return produce(state, draft => {
          delete draft[action.key] 
        }) 
      default: 
        return state
    }
  }
  
  const loadData: LoadData<string, number, State, {}, Action> = (param: string) => async (): Promise<Result<number>> => {
    console.log('load data thunk action')
    return DataResult(toNumber(param))
  }

  const selectData: ParametricSelector<State, CompWithDataProps, number> = (state, {name}) => state[name]

  type CompProps = {
    num: Result<number>
  }

  const Comp: SFC<CompProps> = ({ num }) => {
    promises.resolve(num)
    return null
  }

  type CompWithDataProps = {
    name: string
  }

  const mapProps = (ownProps: CompWithDataProps): string => ownProps.name

  const mapResult = (result: Result<number>): CompProps => ({
    num: result
  })

  test('render valid', async () => {
    const CompWithData: ComponentType<CompWithDataProps> = withData(loadData, selectData, mapProps, mapResult, Comp)

    const div = document.createElement('div')
    const store = createStore(() => ({}), applyMiddleware(thunk.default))
    await render(<Provider store={store}><CompWithData name="a" /></Provider>, div)
    expect(await firstRenderPromise).toEqual(PendingDataResult)
    expect(await secondRenderPromise).toEqual(DataResult(1))
  })
})