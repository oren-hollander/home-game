import * as firebase from 'firebase/app'
import { get, set, omit, map } from 'lodash/fp'

type CollectionReference = firebase.firestore.CollectionReference
type Transaction = firebase.firestore.Transaction
type UpdateData = firebase.firestore.UpdateData
type WriteBatch = firebase.firestore.WriteBatch
type DocumentData = firebase.firestore.DocumentData
type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot

export interface BatchedCollection<T extends object> {
  set(doc: T): void
  update(id: string, update: UpdateData): void
  delete(id: string): void
  commit(): Promise<void>
}

export interface TransactiveCollection<T extends object> {
  get(id: string): Promise<T | undefined>
  set(doc: T): Promise<void>
  update(id: string, update: UpdateData): Promise<void>
  delete(id: string): Promise<void>
}

export interface Collection<T extends object> extends TransactiveCollection<T> {
  add(doc: T): Promise<string>
  transactive(transaction: Transaction): TransactiveCollection<T>
  batched(batch: WriteBatch): BatchedCollection<T>
  subCollection<S extends object>(docId: string, collectionId: string): Collection<S>
  query(): Promise<(T)[]>
  listen(onDocuments: (docs: T[]) => void): () => void
  listenToDoc(docId: string, onDocument: (doc: T) => void): () => void
}

function BatchedCollection<T extends object>(
  batch: WriteBatch,
  collectionRef: CollectionReference,
  idKey: string
): BatchedCollection<T> {
  function setDocument(doc: T): void {
    batch.set(collectionRef.doc(doc[idKey]), omit(idKey, doc))
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

const dataToDoc = <T>(id: string, idKey: string, data: DocumentData): T => <T>set(idKey, id, data)

function TransactiveCollection<T extends object>(
  transaction: Transaction,
  collectionRef: CollectionReference,
  idKey: string
): TransactiveCollection<T> {
  async function getDocument(id: string): Promise<T | undefined> {
    const snapshot = await transaction.get(collectionRef.doc(id))
    if (snapshot.exists) {
      return dataToDoc(id, idKey, snapshot.data()!)
    }
    return undefined
  }

  async function setDocument(doc: T): Promise<void> {
    await transaction.set(collectionRef.doc(doc[idKey]), omit(idKey, doc))
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
    update: updateDocument
  }
}

export function Collection<T extends object>(collectionRef: CollectionReference, idKey: string = 'id'): Collection<T> {
  async function addDocument(doc: T): Promise<string> {
    if (doc[idKey]) {
      await setDocument(doc)
      return doc[idKey]
    } else {
      return collectionRef.add(doc).then(get(idKey))
    }
  }

  async function getDocument(id: string): Promise<T | undefined> {
    const snapshot = await collectionRef.doc(id).get()
    if (snapshot.exists) {
      return dataToDoc(id, idKey, snapshot.data()!)
    }
    return undefined
  }

  async function setDocument(doc: T): Promise<void> {
    return collectionRef.doc(doc[idKey]).set(omit(idKey, doc))
  }

  async function deleteDocument(id: string): Promise<void> {
    return collectionRef.doc(id).delete()
  }

  async function updateDocument(id: string, update: UpdateData): Promise<void> {
    return collectionRef.doc(id).update(update)
  }

  async function query(): Promise<T[]> {
    const querySnapshot = await collectionRef.get()
    return map((qds: QueryDocumentSnapshot) => dataToDoc<T>(qds.id, idKey, qds.data()), querySnapshot.docs)
  }

  function listen(onDocuments: (docs: T[]) => void): () => void {
    return collectionRef.onSnapshot(snapshot => {
      onDocuments(<T[]>map(doc => doc.data(), snapshot.docs))
    })
  }

  function listenToDoc(docId: string, onDocument: (doc: T) => void): () => void {
    return collectionRef.doc(docId).onSnapshot(snapshot => {
      if (snapshot.exists) {
        onDocument(<T>snapshot.data())
      }
    })
  }

  function transactive(transaction: Transaction): TransactiveCollection<T> {
    return TransactiveCollection(transaction, collectionRef, idKey)
  }

  function batched(batch: WriteBatch): BatchedCollection<T> {
    return BatchedCollection(batch, collectionRef, idKey)
  }

  function subCollection<S extends object>(docId: string, collectionId: string): Collection<S> {
    return Collection<S>(collectionRef.doc(docId).collection(collectionId), idKey)
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
    listen,
    listenToDoc
  }
}
