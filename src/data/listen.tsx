// import * as React from 'react'
// import { Component, ComponentType } from 'react'
// import * as firebase from 'firebase/app'
// import { Action, ActionCreator } from 'redux'
// import { connect, MapDispatchToProps } from 'react-redux'
// import { map } from 'lodash/fp'

// type Firestore = firebase.firestore.Firestore

// interface Query {
//   fieldPath: string | firebase.firestore.FieldPath,
//   opStr: firebase.firestore.WhereFilterOp,
//   value: any
// }

// interface SetDataAction<D> extends Action<string>{
//   data: D
// }

// type FetchCollectionDataAction<D> = (path: string, query: Query) => SetDataAction<D>

// export const listenToCollection = <T, D>(path: string, query: Query, fetch: FetchCollectionDataAction<D>) => (Comp: ComponentType<T>) => {
//   interface ListenProps {
//     // setData: (data: D[]) => void
//     fetchData: (path: string, query: Query) => void 
//   }

//   class Listen extends Component<ListenProps> {
//     unsubscribe?: () => void

//     componentDidMount() {
//       const {fieldPath, opStr, value} = query

//       this.props.fetchData(path, query)
//       this.unsubscribe = db.collection(path).where(fieldPath, opStr, value).onSnapshot(snapshot => {
//         this.props.setData(map(doc => doc.data() as D, snapshot.docs))
//       })
//     }

//     componentWillUnmount() {
//       if (this.unsubscribe) {
//         this.unsubscribe()
//       }
//     }

//     render() {
//       return <Comp {...this.props} />
//     }
//   }

//   const mapDispatchToProps: MapDispatchToProps<ListenProps, {}> = dispatch => ({
//     // setData: data => dispatch(setData(data)),
//     fetchData: (path, query) => dispatch(fetchDa)
//   })

//   return connect(null, mapDispatchToProps)(Listen)
// }

// interface SetDocumentDataAction<T> extends Action<string> {
//   data: T
// }

// export const listenToDoc = <T, D>(db: Firestore, path: string, setData: ActionCreator<SetDocumentDataAction<D>>) => (Comp: ComponentType<T>) => {
//   interface ListenProps {
//     setData: (data: D) => void
//   }
  
//   class Listen extends Component<ListenProps> {
//     unsubscribe?: () => void

//     componentDidMount() {
//       this.unsubscribe = db.doc(path).onSnapshot(doc => {
//         this.props.setData(doc.data()! as D)
//       })
//     }

//     componentWillUnmount() {
//       if(this.unsubscribe) {
//         this.unsubscribe()
//       }
//     }

//     render() {
//       return <Comp {...this.props}/>
//     }
//   }

//   const mapDispatchToProps: MapDispatchToProps<ListenProps, {}> = dispatch => ({
//     setData: data => dispatch(setData(data))
//   })

//   return connect(null, mapDispatchToProps)(Listen)
// }