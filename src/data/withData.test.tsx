import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { createStore, applyMiddleware, Reducer } from 'redux'
import { Provider } from 'react-redux'
import * as thunk from 'redux-thunk'
import { ParametricSelector } from 'reselect'
import { produce } from 'immer'
import { render } from '../util/render'
import { Maybe } from '../util/maybe'
import { withData, LoadData, Result, StaleData, FreshData } from './withData'
import { SettlingPromise, promiseChain, PromiseChain } from '../util/promise'
import { has } from 'lodash/fp'
import { Dictionary } from 'lodash'

describe('withData', () => {

  type Entity = {
    id: string
    name: string
  }

  const Entity = (id: string) => ({ id, name: `name of ${id}` })

  type EntityDB = {
    getEntity(id: string): Maybe<Entity>
  }

  const entityDB = (): EntityDB => {
    const entities: Dictionary<Entity> = {
      a: Entity('a'),
      b: Entity('b')
    }

    const getEntity = (id: string): Maybe<Entity> => (has(id, entities) ? entities[id] : null)

    return {
      getEntity
    }
  }

  type Services = {
    entityDB: EntityDB
  }

  type State = {
    readonly entity: Maybe<Entity>
  }

  type SetEntity = {
    type: 'set-entity'
    entity: Entity
  }

  type RemoveEntity = {
    type: 'remove-entity'
  }

  type Action = SetEntity | RemoveEntity

  const setEntity = (entity: Entity): SetEntity => ({ type: 'set-entity', entity })

  const initialState: State = {
    entity: null
  }

  const reducer: Reducer<State, Action> = (state = initialState, action) => {
    switch (action.type) {
      case 'set-entity':
        return produce(state, draft => {
          draft.entity = action.entity
        })
      case 'remove-entity':
        return produce(state, draft => {
          delete draft.entity
        })
      default:
        return state
    }
  }

  const loadEntity: LoadData<string, Maybe<Entity>, State, Services, Action> = (id: string) => async (
    dispatch,
    getState,
    { entityDB }
  ): Promise<Maybe<Entity>> => entityDB.getEntity(id)

  const selectEntity: ParametricSelector<State, never, Maybe<Entity>> = state => state.entity

  type EntityViewProps = {
    entity: Result<Maybe<Entity>>
  }

  const EntityView: SFC<EntityViewProps> = ({ entity }) => {
    renderChain.resolveNext(entity)
    return null
  }

  type EntityConnectorProps = {
    id: string
  }

  const mapProps = (ownProps: EntityConnectorProps): string => ownProps.id

  const mapResult = (entity: Result<Entity>): EntityViewProps => ({ entity })

  let renderChain: PromiseChain<Result<Maybe<Entity>>> 
  let firstRenderPromise: SettlingPromise<Result<Maybe<Entity>>>
  let secondRenderPromise: SettlingPromise<Result<Maybe<Entity>>>

  beforeEach(() => {
    firstRenderPromise = SettlingPromise<Result<Maybe<Entity>>>()
    secondRenderPromise = SettlingPromise<Result<Maybe<Entity>>>()
    renderChain = promiseChain(firstRenderPromise, secondRenderPromise)
  })

  test('render with empty store and valid data', async () => {
    const EntityConnector: ComponentType<EntityConnectorProps> = withData(
      loadEntity,
      setEntity,
      selectEntity,
      mapProps,
      mapResult,
      EntityView
    )

    const div = document.createElement('div')
    const store = createStore(reducer, applyMiddleware(thunk.default.withExtraArgument({ entityDB: entityDB() })))
    await render(
      <Provider store={store}>
        <EntityConnector id="a" />
      </Provider>,
      div
    )
    expect(await firstRenderPromise).toEqual(StaleData(null))
    expect(await secondRenderPromise).toEqual(FreshData(Entity('a')))
  })

  test('render with non empty store and valid data', async () => {
    const EntityConnector: ComponentType<EntityConnectorProps> = withData(
      loadEntity,
      setEntity,
      selectEntity,
      mapProps,
      mapResult,
      EntityView
    )

    const div = document.createElement('div')
    const store = createStore(reducer, applyMiddleware(thunk.default.withExtraArgument({ entityDB: entityDB() })))
    store.dispatch(setEntity(Entity('a')))
    await render(
      <Provider store={store}>
        <EntityConnector id="a" />
      </Provider>,
      div
    )
    expect(await firstRenderPromise).toEqual(StaleData(Entity('a')))
    expect(await secondRenderPromise).toEqual(FreshData(Entity('a')))
  })
})
