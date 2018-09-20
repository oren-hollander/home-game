// import * as React from 'react'
// import { SFC, ComponentType } from 'react'
// import { createStore, applyMiddleware, Reducer, Store } from 'redux'
// import { Provider } from 'react-redux'
// import * as thunk from 'redux-thunk'
// import { ParametricSelector } from 'reselect'
// import { produce } from 'immer'
// import { render } from '../util/render'
// import { Maybe, Just, Nothing } from '../util/maybe'
// import { withData, LoadData, Result, StaleData, FreshData } from './withData'
// import { SettlingPromise, promiseChain, PromiseChain } from '../util/promise'
// import { has } from 'lodash/fp'
// import { Dictionary } from 'lodash'

// describe('withData', () => {

//   type Entity = {
//     id: string
//     name: string
//   }

//   const Entity = (id: string) => ({ id, name: `name of ${id}` })

//   type EntityDB = {
//     getEntity(id: string): Maybe<Entity>
//   }

//   const entityDB = (): EntityDB => {
//     const entities: Dictionary<Entity> = {
//       a: Entity('a'),
//       b: Entity('b')
//     }

//     const getEntity = (id: string): Maybe<Entity> => has(id, entities) ? Just(entities[id]) : Nothing

//     return {
//       getEntity
//     }
//   }

//   type Services = {
//     entityDB: EntityDB
//   }

//   type State = {
//     readonly entity: Maybe<Entity>
//   }

//   type SetEntity = {
//     type: 'set-entity'
//     entity: Maybe<Entity>
//   }

//   type RemoveEntity = {
//     type: 'remove-entity'
//   }

//   type Action = SetEntity | RemoveEntity

//   const setEntity = (entity: Maybe<Entity>): SetEntity => ({ type: 'set-entity', entity })

//   const initialState: State = {
//     entity: Nothing
//   }

//   const reducer: Reducer<State, Action> = (state = initialState, action) => {
//     switch (action.type) {
//       case 'set-entity':
//         return {...state, entity: action.entity}
//       case 'remove-entity':
//         return produce(state, draft => {
//           draft.entity = Nothing
//         })
//       default:
//         return state
//     }
//   }

//   const loadEntity: LoadData<string, Entity, State, Services, Action> = (id: string) => async (
//     dispatch,
//     getState,
//     { entityDB }
//   ): Promise<Maybe<Entity>> => entityDB.getEntity(id)

//   const selectEntity: ParametricSelector<State, never, Maybe<Entity>> = state => has('entity', state) ? state.entity : Nothing

//   type EntityViewProps = {
//     entity: Result<Maybe<Entity>>
//   }

//   const EntityView: SFC<EntityViewProps> = ({ entity }) => {
//     renderChain.resolveNext(entity)
//     return null
//   }

//   type EntityConnectorProps = {
//     id: string
//   }

//   const mapProps = (ownProps: EntityConnectorProps): string => ownProps.id

//   const mapResult = (entity: Result<Maybe<Entity>>): EntityViewProps => ({ entity })

//   let renderChain: PromiseChain<Result<Maybe<Entity>>> 
//   let firstRenderPromise: SettlingPromise<Result<Maybe<Entity>>>
//   let secondRenderPromise: SettlingPromise<Result<Maybe<Entity>>>
//   let EntityConnector: ComponentType<EntityConnectorProps> 
//   let store: Store<State, Action>
//   let div: HTMLDivElement

//   beforeEach(() => {
//     firstRenderPromise = SettlingPromise<Result<Maybe<Entity>>>()
//     secondRenderPromise = SettlingPromise<Result<Maybe<Entity>>>()
//     renderChain = promiseChain(firstRenderPromise, secondRenderPromise)

//     EntityConnector = withData(
//       loadEntity,
//       setEntity,
//       selectEntity,
//       mapProps,
//       mapResult,
//       EntityView
//     )

//     div = document.createElement('div')
//     store = createStore(reducer, applyMiddleware(thunk.default.withExtraArgument({ entityDB: entityDB() })))
//   })

//   test('render with empty store and valid data', async () => {
//     await render(
//       <Provider store={store}>
//         <EntityConnector id="a" />
//       </Provider>,
//       div
//     )
//     expect(await firstRenderPromise).toEqual(StaleData(Nothing))
//     expect(await secondRenderPromise).toEqual(FreshData(Just(Entity('a'))))
//   })

//   test('render with non empty store and valid data', async () => {
//     store.dispatch(setEntity(Just(Entity('a'))))
//     await render(
//       <Provider store={store}>
//         <EntityConnector id="b" />
//       </Provider>,
//       div
//     )
//     expect(await firstRenderPromise).toEqual(StaleData(Just(Entity('a'))))
//     expect(await secondRenderPromise).toEqual(FreshData(Just(Entity('b'))))
//   })

//   test('render with empty store and missing data', async () => {
//     await render(
//       <Provider store={store}>
//         <EntityConnector id="c" />
//       </Provider>,
//       div
//     )
//     expect(await firstRenderPromise).toEqual(StaleData(Nothing))
//     expect(await secondRenderPromise).toEqual(FreshData(Nothing))
//   })

//   test('render with non empty store and missing data', async () => {
//     store.dispatch(setEntity(Just(Entity('a'))))
//     await render(
//       <Provider store={store}>
//         <EntityConnector id="c" />
//       </Provider>,
//       div
//     )
//     expect(await firstRenderPromise).toEqual(StaleData(Just(Entity('a'))))
//     expect(await secondRenderPromise).toEqual(FreshData(Nothing))
//   })
// })
