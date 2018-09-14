import {
  last,
  size,
  map,
  isEmpty,
  has,
  concat,
  cloneDeep,
  without,
  init,
  forEach,
  filter,
  isUndefined,
  sortBy
} from 'lodash/fp'

type Unsubscribe = () => void
type DocumentCallback = (data: DocumentData) => void
type CollectionCallback = (data: DocumentData[]) => void

export type DocumentData = { [field: string]: any }

interface DocumentRef {
  readonly id: string
  get(): Promise<DocumentData | undefined>
  set(data: DocumentData): Promise<void>
  delete(): Promise<void>
  collection(name: string): CollectionRef
  onSnapshot(callback: DocumentCallback): Unsubscribe
}

interface Query {
  orderBy(field: string): Query
  get(): Promise<ReadonlyArray<DocumentData>>
  onSnapshot(callback: CollectionCallback): Unsubscribe
}

interface CollectionRef extends Query {
  name: string
  doc(id: string): DocumentRef
}

export interface DB {
  collection(name: string): CollectionRef
}

export const MemDB: () => DB = () => {
  type Notification<T> = (data: T) => void
  type DocumentNotification = Notification<DocumentData>
  type CollectionNotification = Notification<DocumentData[]>

  interface Document {
    collections: Collections
    data: DocumentData | undefined
    notifications: DocumentNotification[]
  }

  interface Documents {
    [key: string]: Document
  }

  interface Collection {
    documents: Documents
    notifications: CollectionNotification[]
  }

  interface Collections {
    [key: string]: Collection
  }

  let collections: Collections = {}

  const getCollection: (path: string[], collections: Collections) => Collection = (path, collections) => {
    if (size(path) < 1) {
      throw new Error('expected at least 1 element in the path')
    }

    const [collectionName, documentId, ...nextPath] = path

    if (!has(collectionName, collections)) {
      collections[collectionName] = {
        documents: {},
        notifications: []
      }
    }

    const col: Collection = collections[collectionName]

    if (isEmpty(nextPath)) {
      return collections[collectionName]
    }

    if (!has(documentId, col.documents)) {
      col.documents[documentId] = {
        data: undefined,
        collections: {},
        notifications: []
      }
    }

    const doc: Document = col.documents[documentId]

    return getCollection(nextPath, doc.collections)
  }

  const getDocument: (path: string[], collections: Collections) => Document = (path, collections) => {
    if (size(path) < 2) {
      throw new Error('expected at least 2 elements in the path')
    }

    const [collectionName, documentId, ...nextPath] = path

    if (!has(collectionName, collections)) {
      collections[collectionName] = {
        documents: {},
        notifications: []
      }
    }

    const col: Collection = collections[collectionName]

    if (!has(documentId, col.documents)) {
      col.documents[documentId] = {
        data: undefined,
        collections: {},
        notifications: []
      }
    }

    const doc: Document = col.documents[documentId]

    return isEmpty(nextPath) ? doc : getDocument(nextPath, doc.collections)
  }

  const CollectionRef: (path: string[]) => CollectionRef = path => ({
    name: last(path)!,
    doc: (id: string) => DocumentRef(concat(path, [id])),
    get: async () => {
      const col = getCollection(path, collections)
      return map(doc => doc.data!, filter(doc => isUndefined(doc.data), col.documents))
    },
    orderBy(field: string) {
      return {
        get: async () => {
          const col = getCollection(path, collections)
          const docsData = map(doc => doc.data!, filter(doc => isUndefined(doc.data), col.documents))
          return sortBy(field, docsData)
        },
        orderBy() {
          throw new Error('not implemented')
        },
        onSnapshot(callback: CollectionCallback) {
          const col = getCollection(path, collections)
          col.notifications = concat([callback], col.notifications)
          // notifyCollectionListeners(col)
          return () => {
            const col = getCollection(path, collections)
            col.notifications = without([callback], col.notifications)
          }
        }
      }
    },
    onSnapshot: (callback: CollectionCallback) => {
      const col = getCollection(path, collections)
      col.notifications = concat([callback], col.notifications)
      notifyCollectionListeners(col)
      return () => {
        const col = getCollection(path, collections)
        col.notifications = without([callback], col.notifications)
      }
    }
  })

  const notifyDocumentListeners = (document: Document) => {
    forEach(notification => {
      notification(cloneDeep(document.data!))
    }, document.notifications)
  }

  const notifyCollectionListeners = (collection: Collection) => {
    const docs: DocumentData[] = map(doc => cloneDeep(doc.data!), collection.documents)
    forEach(notification => {
      notification(docs)
    }, collection.notifications)
  }

  const DocumentRef: (path: string[]) => DocumentRef = path => ({
    id: last(path)!,
    get: async () => cloneDeep(getDocument(path, collections).data),
    set: async (documentData: DocumentData) => {
      const document = getDocument(path, collections)
      document.data = cloneDeep(documentData)
      notifyDocumentListeners(document)
      notifyCollectionListeners(getCollection(init(path), collections))
    },
    delete: async () => {
      getDocument(path, collections).data = undefined
      notifyCollectionListeners(getCollection(init(path), collections))
    },
    collection: (name: string) => CollectionRef(concat(path, [name])),
    onSnapshot: (callback: DocumentCallback) => {
      const doc = getDocument(path, collections)
      doc.notifications = concat([callback], doc.notifications)
      notifyDocumentListeners(doc)
      return () => {
        const doc = getDocument(path, collections)
        doc.notifications = without([callback], doc.notifications)
      }
    }
  })

  const collection: (name: string) => CollectionRef = name => CollectionRef([name])

  return {
    collection
  }
}
