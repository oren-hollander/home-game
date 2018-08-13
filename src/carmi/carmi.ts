// import {assign, filter, mapValues, set} from 'lodash/fp'

// export type Data = {
//   readonly [key: string]: any
// }

// export type Computations<D extends Data> = {
//   readonly [key: string]: (data: D) => any
// }

// export type Computed<D extends Data, C extends Computations<D>> = {
//   readonly [K in keyof C]: ReturnType<C[K]>
// }

// type MutationFunction = (value: any) => void
// type MutationValue = [string | string[], MutationFunction] 

// export type Mutations<D extends Data> = {
//   readonly [key in keyof D]: MutationValue
// }

// export type Mutators<D extends Data, M extends Mutations<D>> = {
//   readonly [K in keyof M]: MutationFunction
// }

// export type Model<D extends Data, C extends Computations<D>, M extends Mutations<D>> =
//   (initialValue: D, computations: C, mutations: M) => C & Computed<C, D> & Mutators<D, M>

// const Model = <D extends Data, C extends Computations<D>, M extends Mutations<D>>(initialValue: D, computations: C, mutations: M): D & Computed<C, D> & Mutators<D, M> => {
//   const computed: Computed<D, C> = mapValues(c => c(initialValue), computations) as Computed<D, C>

//   const mutators: Mutators<D, M> = mapValues((mv: MutationValue) => {
//     const path = mv[0]
//     const mutator = mv[1]
//     return (value: any) => {
//       set(path, value, model)
//     }
//   }, mutations)
  
//   const model = assign(assign(initialValue, computed), mutators)

//   return model
// }