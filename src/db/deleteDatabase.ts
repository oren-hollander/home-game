import * as firebase from 'firebase/app'
import { map, flatten, keys, concat, forEach, chunk } from 'lodash/fp'

type Firestore = firebase.firestore.Firestore
type DocumentReference = firebase.firestore.DocumentReference
type CollectionReference = firebase.firestore.CollectionReference

export interface Schema {
  [name: string]: Schema
}

export const getDocumentRefs = async (collection: (name: string) => CollectionReference, schema: Schema): Promise<DocumentReference[]> => {
  const getCollectionDocumentRefs = async (name: string): Promise<DocumentReference[]> => {
    const snapshot = await collection(name).get()
    return map(snapshot => snapshot.ref, snapshot.docs)
  }

  const collectionNames = keys(schema)

  return flatten(await Promise.all(map(async name => {
    const refs = await getCollectionDocumentRefs(name)
    const subRefs = flatten(await Promise.all(map(ref => getDocumentRefs(ref.collection.bind(ref), schema[name]), refs)))
    return concat(refs, subRefs)
  }, collectionNames)))
}

export const deleteDocuments = async (db: Firestore, documentReferences: DocumentReference[]): Promise<void> => {
  const chunks = chunk(500, documentReferences)
  await Promise.all(map(chunk => {
    const batch = db.batch()
    forEach(ref => batch.delete(ref), chunk)
    return batch.commit()
  }, chunks))
}