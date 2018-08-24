import * as React from 'react'
import { render } from 'react-dom'
import { SFC } from 'react'
import { Firestore } from '../app/firestore'
import { Reducer, Action, createStore } from 'redux'
import { Selector, Provider } from 'react-redux'
import { identity } from 'lodash/fp'
import { withData } from './withData'
import { defineExpectations, Expectation } from './expectEvents';

describe('with data', () => {
  let db: firebase.firestore.Firestore

  beforeEach(async () => {
    db = Firestore()
    await db.collection('test').doc('test').set({s: 'b', i: 2})
  })

  test('', async () => {
    interface Data {
      s: string
      i: number
    }

    interface SetDataAction extends Action<string> {
      type: 'set-data'
      data: Data
    }

    const setData = (data: Data) => ({type: 'set-data', data}) 

    const reducer: Reducer<Data, SetDataAction> = (state = {s: 'a', i: 1}, action) => {
      switch (action.type) {
        case 'set-data':
          return action.data
        default:
          return state
      }
    }

    const expectations = defineExpectations(
      Expectation('propsReceived', (data: Data) => {
        expect(data).toEqual({ s: 'a', i: 1 })
      }),
      Expectation('stateUpdated', (data: Data) => {
        expect(data).toEqual({ s: 'b', i: 2 })
      }), 
      Expectation('propsReceived', (data: Data) => {
        expect(data).toEqual({ s: 'b', i: 2 })
      })
    )

    const store = createStore(reducer)

    store.subscribe(() => {
      expectations.expect('stateUpdated', store.getState())
    })

    interface DataProps {
      readonly data: Data
    }

    const selector: Selector<Data, {}, DataProps> = identity

    const DataViewer: SFC<DataProps> = ({data}) => {
      expectations.expect('propsReceived', data)
      return null
    }

    const ConnectedDataViewer = withData(db, selector, setData)(DataViewer)
    
    const div = document.createElement('div');
    render(<Provider store={store}><ConnectedDataViewer path='test/test'/></Provider>, div)

    return expectations.wait
  })
})