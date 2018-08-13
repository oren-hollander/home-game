import * as React from 'react'
import {ComponentType} from 'react'
import {connect, MapDispatchToProps, MapStateToProps, Selector} from 'react-redux'
import {Action, ActionCreator} from 'redux'
import {Component} from 'react'
import * as firebase from 'firebase/app'

type Firestore = firebase.firestore.Firestore

interface SetDataAction<T> extends Action<string> {
  data: T
}

interface DataOwnProps {
  path: string
}

interface DataProps<T extends object>  {
  data: T
}

export const withData = <T extends object>(db: Firestore, selector: Selector<any, T, {}>, actionCreator: ActionCreator<SetDataAction<T>>) =>
  (Comp: ComponentType<DataProps<T>>): ComponentType<DataOwnProps> => {
    interface StateProps {
      data: T | undefined
      db: Firestore
    }

    interface DispatchProps {
      setData: (t: T) => void
    }

    type Props<T extends object> = StateProps & DispatchProps

    const mapStateToProps: MapStateToProps<StateProps, DataOwnProps, any> = (state, props) => ({
      db,
      data: selector(state, props)
    })

    const mapDispatchToProps: MapDispatchToProps<DispatchProps, never> = dispatch => ({
      setData: data => dispatch(actionCreator(data))
    })

    const Loader = class extends Component<Props<T> & DataOwnProps & {db: Firestore}> {
      async componentDidMount(){
        const doc = await this.props.db.doc(this.props.path).get()
        const data = doc.data()
        if (data) {
          this.props.setData(data as T)
        }
      }

      render() {
        return this.props.data ? <Comp data={this.props.data}/> : <span>'Loading'</span>
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(Loader)
  }

interface DataEditorProps<T extends object> extends DataProps<T> {
  saveData: (data: T) => void
}

export const withDataEditor = <T extends object>(db: Firestore, selector: Selector<any, T, {}>, 
  setDataActionCreator: ActionCreator<SetDataAction<T>>, saveDataActionCreator: ActionCreator<SetDataAction<T>>) =>
  
  (Comp: ComponentType<DataEditorProps<T>>) => {
    interface StateProps {
      data: T | undefined
      db: Firestore
    }

    interface DispatchProps {
      setData: (t: T) => void
      saveData: (t: T) => void
    }

    type Props<T extends object> = StateProps & DispatchProps

    const mapStateToProps: MapStateToProps<StateProps, DataOwnProps, any> = (state, props) => ({
      db,
      data: selector(state, props)
    })

    const mapDispatchToProps: MapDispatchToProps<DispatchProps, never> = dispatch => ({
      setData: data => dispatch(setDataActionCreator(data)),
      saveData: data => dispatch(saveDataActionCreator(data))
    })

    const Loader = class extends Component<Props<T> & DataOwnProps & { db: Firestore }> {
      async componentDidMount() {
        const doc = await this.props.db.doc(this.props.path).get()
        const data = doc.data()
        if (data) {
          this.props.setData(data as T)
        }
      }

      render() {
        return this.props.data ? <Comp data={this.props.data} saveData={this.props.saveData}/> : <span>'Loading'</span>
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(Loader)
  }