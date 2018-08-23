import * as firebase from 'firebase/app'

export interface Codec<T> {
  modelToDbEntity(modelEntity: T): firebase.firestore.DocumentData
  dbToModelEntity(data: firebase.firestore.DocumentData): T
}