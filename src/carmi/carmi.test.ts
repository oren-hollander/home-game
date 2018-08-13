// import { filter, mapValues } from 'lodash/fp'
// import {Computations, Computed, Data} from './carmi'

// test('inference', () => {
//   // type Data = {
//   //   readonly [key: string]: any
//   // }

//   // type Computations<D extends Data> = {
//   //   readonly [key: string]: (data: D) => any
//   // }

//   // interface MyData extends Data{
//   //   i: number
//   //   s: string
//   // }

//   // interface MyDataComputations extends Computations<Data> {
//   //   readonly twice: (data: MyData) => number
//   // }

//   // const myData: MyData = {
//   //   i: 11,
//   //   s: 'sss'
//   // }
//   // const myComps: MyDataComputations = {
//   //   twice: data => data.i * 2
//   // }

//   // const process = <D extends Data, T extends Computations<D>>(c: T): T => c 

//   // const mc = process(myComps)
//   // const x = mc.twice(myData)
//   // console.log(x)
// })

// test('carmi', () => {
//   type Filter = 'all' | 'done' | 'pending'

//   interface Todo {
//     title: string
//     done: boolean
//   }

//   interface Todos extends Data {
//     todos: Todo[]
//     filter: Filter
//   }

//   interface TodosComputations extends Computations<Todos> {
//     visibleTodos: (todos: Todos) => Todo[]
//   }

//   interface TodosComputed extends Computed<Todos, TodosComputations> {
//     visibleTodos: Todo[]
//   }

//   const todosComputations: TodosComputations = {
//     visibleTodos: (todos): Todo[] =>
//       todos.filter === 'all'
//         ? todos.todos
//         : todos.filter === 'done'
//           ? filter(todo => todo.done, todos.todos)
//           : filter(todo => !todo.done, todos.todos)
//   }

//   const initialTodos: Todos = {
//     todos: [
//       {
//         title: 'task 1',
//         done: true
//       }
//     ],
//     filter: 'done'
//   }
  
//   const computed: TodosComputed = mapValues(c => c(initialTodos), todosComputations) as TodosComputed
//   const x = computed.visibleTodos
//   console.log(x)
// })