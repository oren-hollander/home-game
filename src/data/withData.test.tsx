import * as React from 'react'
import { SFC, ComponentType } from 'react' 
import { withData, LoadData, Result, DataResult, PendingDataResult } from './withData'
import { toNumber } from 'lodash/fp'
import { SettlingPromise, promiseChain } from '../util/promise'
import { render } from '../util/render'
import { Action, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import * as thunk from 'redux-thunk'

describe('withData', () => {
  const firstRenderPromise = SettlingPromise<Result<number>>()
  const secondRenderPromise = SettlingPromise<Result<number>>()
  const promises = promiseChain(firstRenderPromise, secondRenderPromise)

  const loadData: LoadData<string, number, {}, {}, Action> = (param: string) => async (): Promise<Result<number>> => {
    console.log('load data thunk action')
    return DataResult(toNumber(param))
  }

  type CompProps = {
    num: Result<number>
  }

  const Comp: SFC<CompProps> = ({ num }) => {
    promises.resolve(num)
    return null
  }

  type CompWithDataProps = {
    numericString: string
  }

  const mapProps = (ownProps: CompWithDataProps): string => ownProps.numericString

  const mapResult = (result: Result<number>): CompProps => ({
    num: result
  })

  test('render valid', async () => {
    const CompWithData: ComponentType<CompWithDataProps> = withData(loadData, mapProps, mapResult, Comp)

    const div = document.createElement('div')
    const store = createStore(() => ({}), applyMiddleware(thunk.default))
    await render(<Provider store={store}><CompWithData numericString="1" /></Provider>, div)
    expect(await firstRenderPromise).toEqual(PendingDataResult)
    expect(await secondRenderPromise).toEqual(DataResult(1))
  })
})