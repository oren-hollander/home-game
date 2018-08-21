import { app as firebaseApp, firestore } from 'firebase/app'
import { forEach, last, initial, split, join, map, get, isEqual, update, chunk, fromPairs, merge } from 'lodash/fp'
import { isUndefined } from 'util';

type App = firebaseApp.App
type Firestore = firestore.Firestore
type WriteBatch = firebase.firestore.WriteBatch
type DocumentReference = firestore.DocumentReference
type CollectionReference = firestore.CollectionReference
type DocumentData = firestore.DocumentData
type SetOptions = firestore.SetOptions
type UpdateData = firestore.UpdateData
type FieldPath = firestore.FieldPath
type Transaction = firestore.Transaction
type GetOptions = firestore.GetOptions
type DocumentSnapshot = firestore.DocumentSnapshot
type SnapshotMetadata = firestore.SnapshotMetadata
type SnapshotOptions = firestore.SnapshotOptions
type FirestoreError = firestore.FirestoreError
type QuerySnapshot = firestore.QuerySnapshot

const notImplemented: () => never = () => {
  throw new Error('not implemented')
}

const app: App = {
  auth: notImplemented,
  database: notImplemented,
  firestore: notImplemented,
  delete: notImplemented,
  functions: notImplemented,
  messaging: notImplemented,
  storage: notImplemented,
  name: '',
  options: {}
}

interface SetOp {
  op: 'set'
  documentRef: DocumentReference,
  data: DocumentData,
  options: SetOptions
}

interface DeleteOp {
  op: 'delete',
  documentRef: DocumentReference
}

interface UpdateOp1 {
  op: 'update1'
  documentRef: DocumentReference
  data: DocumentData
}

interface UpdateOp2 {
  op: 'update2'
  documentRef: DocumentReference
  field: string | FieldPath,
  value: any,
  moreFieldsAndValues: any[]
}

type BatchOp = SetOp | DeleteOp | UpdateOp1 | UpdateOp2

interface Observer<T> {
  next?: (snapshot: DocumentSnapshot) => void;
  error?: (error: FirestoreError) => void;
}

interface Document {
  readonly data?: DocumentData
  readonly observers: Observer<DocumentSnapshot>[]
}

interface Collection {
  readonly documents: {[id: string]: Document}
  readonly observers: Observer<QuerySnapshot>
}

interface Collections {
  readonly [path: string]: Collection
}


const Firestore: () => Firestore = () => {

  let collections: Collections = {}

  const WriteBatch: () => WriteBatch = () => {

    let ops: ReadonlyArray<BatchOp> = []

    const set = (documentRef: DocumentReference, data: DocumentData, options?: SetOptions) => {
      ops = [...ops, { op: 'set', documentRef, data, options }]
      return api
    }

    const deleteDocument = (documentRef: DocumentReference) => {
      ops = [...ops, { op: 'delete', documentRef }]
      return api
    }

    function update(documentRef: DocumentReference, ...args: any[]) {
      if (args.length === 1) {
        const [data] = args
        ops = [...ops, { op: 'update1', documentRef, data }]
      } else {
        const [field, value, ...moreFieldsAndValues] = args
        ops = [...ops, { op: 'update2', documentRef, field, value, moreFieldsAndValues }]
      }
      return api
    }

    const commit = async () => {
      forEach(op => {
        switch (op.op) {
          case 'set':
            op.documentRef.set(op.data, op.options)
            break
          case 'delete':
            op.documentRef.delete()
            break
          case 'update1':
            op.documentRef.update(op.data)
            break
          case 'update2':
            op.documentRef.update(op.field, op.value, op.moreFieldsAndValues)
        }
      }, ops)

      ops = []
    }

    const api = {
      set,
      delete: deleteDocument,
      update,
      commit
    }

    return api
  }

  const SnapshotMetadata: SnapshotMetadata = {
    fromCache: false,
    hasPendingWrites: false,
    isEqual(md: SnapshotMetadata) {
      return true
    }
  } 

  const DocumentSnapshot: (ref: DocumentReference, data?: DocumentData) => DocumentSnapshot = (ref, data) => {
    return {
      id: ref.id,
      ref,
      exists: !isUndefined(data),
      metadata: SnapshotMetadata,
      data(options?: SnapshotOptions) {
        return data
      },
      get(fieldPath: string, options?: SnapshotOptions){
        return get(fieldPath, data)
      },
      isEqual(other: DocumentSnapshot) {
        return ref.isEqual(other.ref) && isEqual(data, other.data())
      }
    }
  }

  const DocumentReference: (parent: CollectionReference, id: string) => DocumentReference = (parent, id) => {
    const path = `${parent.path}/${id}`

    const notifyObservers = () => {
      forEach(
        observer => observer.next(DocumentSnapshot(docRef, collections[parent.path].documents[id].data)),
        collections[parent.path].documents[id].observers
      )
    }

    const docRef = {
      firestore,
      id,
      parent,
      path,
      collection(collectionPath: string): CollectionReference {
        return CollectionReference(docRef, `${path}/${collectionPath}`)
      },
      delete: async () => {
        collections = update([parent.path, 'documents', id, 'data'], () => undefined, collections) 
        notifyObservers()
      },
      async get(options?: GetOptions): Promise<DocumentSnapshot> {
        return DocumentSnapshot(docRef, collections[parent.path].documents[id].data) as DocumentSnapshot
      },
      isEqual: (other: DocumentReference) => path === other.path,
      onSnapshot: notImplemented,
      set: async (data: DocumentData, options?: SetOptions) => {
        collections = update([parent.path, 'documents', id, 'data'], () => data, collections)
        notifyObservers()
      },
      update: async (...args: any[]) => {
        const data = args.length === 1
          ? args[0] as UpdateData
          : fromPairs(chunk(2, args)) as UpdateData
        
        collections = update([parent.path, 'documents', id, 'data'], merge(data), collections)
        notifyObservers()
      }
    }

    return docRef
  }

  const CollectionReference: (parent: DocumentReference | null, id: string) => CollectionReference = (parent, id) => {
    const path = parent ? `${parent.path}/${id}` : id
    return {
      firestore,
      id,
      parent,
      path,
      add: notImplemented,
      doc: notImplemented,
      endAt: notImplemented,
      endBefore: notImplemented,
      get: notImplemented,
      isEqual: notImplemented,
      limit: notImplemented,
      onSnapshot: notImplemented,
      orderBy: notImplemented,
      startAfter: notImplemented,
      startAt: notImplemented,
      where: notImplemented
    }
  }

  const parent = (path: string) => {
    const elements = split('/', path)
    if (elements.length <= 1)
      return null
    else 
      return join('/', initial(elements))
  }

  const collection = (collectionPath: string) => {
    const parentDocumentPath = parent(collectionPath)
    return CollectionReference(parentDocumentPath ? doc(parentDocumentPath) : null, collectionPath)
  }

  const doc = (documentPath: string) => DocumentReference(collection(parent(documentPath)), documentPath)

  const runTransaction = async <T>(updateFunction: (tx: Transaction) => Promise<T>) => {

    let ops: ReadonlyArray<BatchOp> = []

    const tx: Transaction = {
      get: async (documentRef: DocumentReference) => {
        if(ops.length > 0) {
          throw new Error(`can't read after writes in a transaction`)
        }
        return documentRef.get()
      },
      delete: (documentRef: DocumentReference) => {
        ops = [...ops, {op: 'delete', documentRef}]
        return tx
      },
      set: (documentRef: DocumentReference, data: DocumentData, options?: SetOptions) => {
        ops = [...ops, {op: 'set', documentRef, data, options}]
        return tx
      },
      update: (documentRef: DocumentReference, ...args: any[]) => {
        if (args.length === 1) {
          const [data] = args
          ops = [...ops, { op: 'update1', documentRef, data }]
        } else {
          const [field, value, ...moreFieldsAndValues] = args
          ops = [...ops, { op: 'update2', documentRef, field, value, moreFieldsAndValues }]
        }
        return tx
      }
    }

    const result = await updateFunction(tx)

    const promises = map(op => {
      switch(op.op) {
        case 'set': 
          return op.documentRef.set(op.data, op.options)
        case 'delete':
          return op.documentRef.delete()
        case 'update1': 
          return op.documentRef.update(op.data)
        case 'update2':
          return op.documentRef.update(op.field, op.value, op.moreFieldsAndValues)
      }
    }, ops)
    
    await Promise.all(promises)
    return result
  }

  const firestore: Firestore = {  
    app,
    batch: WriteBatch,
    collection,
    doc,
    runTransaction,
    settings: notImplemented,
    disableNetwork: notImplemented,
    enableNetwork: notImplemented,
    enablePersistence: notImplemented,
    INTERNAL: {
      delete: notImplemented
    }
  } 

  return firestore
}