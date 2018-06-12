import * as firebase from 'firebase'
import { set, omit, map } from 'lodash/fp'

type CollectionReference = firebase.firestore.CollectionReference
type Transaction = firebase.firestore.Transaction
type UpdateData = firebase.firestore.UpdateData
type WriteBatch = firebase.firestore.WriteBatch
type DocumentData = firebase.firestore.DocumentData
type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot

export interface Id {
  readonly id: string
}

export interface BatchedCollection<T> { 
  set(doc: T & Id): void
  update(id: string, update: UpdateData): void
  delete(id: string): void
  commit(): Promise<void>
}

export interface TransactiveCollection<T>  {
  get(id: string): Promise<T & Id | void>
  set(doc: T & Id): Promise<void>
  update(id: string, update: UpdateData): Promise<void>
  delete(id: string): Promise<void>
}

export interface Collection<T> extends TransactiveCollection<T> {
  add(doc: T): Promise<string>
  transactive(transaction: Transaction): TransactiveCollection<T>
  batched(batch: WriteBatch): BatchedCollection<T>
  subCollection<S>(docId: string, collectionId: string): Collection<S>,
  query(): Promise<(T & Id)[]>
}

const omitId = omit(['id'])

function BatchedCollection<T>(batch: WriteBatch, collectionRef: CollectionReference): BatchedCollection<T> {
  function setDocument(doc: T & Id): void {
    batch.set(collectionRef.doc(doc.id), omitId(doc))
  }

  function deleteDocument(id: string): void {
    batch.delete(collectionRef.doc(id))
  }

  function updateDocument(id: string, update: UpdateData): void {
    batch.update(collectionRef.doc(id), update)
  }
  
  function commit(): Promise<void> {
    return batch.commit()
  }

  return {
    set: setDocument,
    delete: deleteDocument,
    update: updateDocument,
    commit
  }
}

const dataToDoc = <T>(id: string, data: DocumentData): T & Id => <T & Id>set('id', id, data)

function TransactiveCollection<T>(transaction: Transaction, collectionRef: CollectionReference): TransactiveCollection<T> {
  async function getDocument(id: string): Promise<T & Id | void> {
    const snapshot = await transaction.get(collectionRef.doc(id))
    if (snapshot.exists) {
      return dataToDoc<T>(id, <DocumentData>snapshot.data())
    }
  }

  async function setDocument(doc: T & Id): Promise<void> {
    await transaction.set(collectionRef.doc(doc.id), omitId(doc))
    return
  }

  async function deleteDocument(id: string): Promise<void> {
    await transaction.delete(collectionRef.doc(id))
    return 
  }

  async function updateDocument(id: string, update: UpdateData): Promise<void> {
    transaction.update(collectionRef.doc(id), update)
    return
  }

  return {
    get: getDocument,
    set: setDocument,
    delete: deleteDocument,
    update: updateDocument,
  }
}

export function Collection<T>(collectionRef: CollectionReference): Collection<T> {
  
  async function addDocument(doc: T): Promise<string> {
    return collectionRef.add(doc).then(docRef => docRef.id)
  }

  async function getDocument(id: string): Promise<T & Id | void> {
    const snapshot = await collectionRef.doc(id).get()
    if(snapshot.exists){
      return <T & Id>set('id', id, <object>snapshot.data())
    }
  }

  async function setDocument(doc: T & Id): Promise<void> {
    return collectionRef.doc(doc.id).set(omitId(doc))
  }

  async function deleteDocument(id: string): Promise<void> {
    return collectionRef.doc(id).delete()
  }

  async function updateDocument(id: string, update: UpdateData): Promise<void> {
    return collectionRef.doc(id).update(update)
  }

  function transactive(transaction: Transaction): TransactiveCollection<T> {
    return TransactiveCollection<T>(transaction, collectionRef)
  }

  function batched(batch: WriteBatch): BatchedCollection<T> {
    return BatchedCollection<T>(batch, collectionRef)
  }

  function subCollection<S>(docId: string, collectionId: string): Collection<S> {
    return Collection<S>(collectionRef.doc(docId).collection(collectionId))
  }

  async function query(): Promise<(T & Id)[]> {
    const querySnapshot = await collectionRef.get()
    return map((qds: QueryDocumentSnapshot) => dataToDoc<T>(qds.id, qds.data()), querySnapshot.docs)
  }

  return {
    add: addDocument, 
    get: getDocument,
    set: setDocument,
    delete: deleteDocument,
    update: updateDocument,
    transactive,
    batched,
    subCollection,
    query,
  }
} 