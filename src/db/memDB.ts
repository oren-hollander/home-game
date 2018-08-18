import { last, init, get, set, concat, without, update } from 'lodash/fp'

type Unsubscribe = () => void
type DocumentCallback = (data: DocumentData) => void
type CollectionCallback = (data: DocumentData[]) => void

interface DocumentData {
  [key: string]: DocumentData
  [key: number]: DocumentData
}

interface DocumentRef {
  readonly id: string,
  get(): Promise<DocumentData>,
  set(data: DocumentData): Promise<void>
  collection(name: string): CollectionRef
  onSnapshot(callback: DocumentCallback): Unsubscribe
}

interface CollectionRef {
  name: string
  doc(id: string): DocumentRef
  onSnapshot(callback: CollectionCallback): Unsubscribe
}

export interface DB {
  collection(name: string): CollectionRef
}

export const MemDB: () => DB = () => {

  let data: DocumentData

  const prefixPath: (prefix: string) => (path: string[]) => string[] = prefix => path => concat(init(path), [`${prefix}-${last(path)!}`])

  const dataPath = prefixPath('data-')
  const callbackPath = prefixPath('callback-')

  const CollectionRef: (path: string[]) => CollectionRef = path => ({
    name: last(path)!,
    doc: (id: string) => DocumentRef(concat(dataPath(path), [id])),
    onSnapshot: (callback: CollectionCallback) => {
      data = update(callbackPath(path), concat([callback]), data)
      return () => { 
        data = update(callbackPath(path), without([callback]), data)
      }
    }
  })

  const DocumentRef: (path: string[]) => DocumentRef = path => ({
    id: last(path)!,
    get: async () => get(dataPath(path), data),
    set: async (documentData: DocumentData) => {
      data = set(dataPath(path), documentData, data)
      
    },
    collection: (name: string) => CollectionRef(concat(dataPath(path), [name])),
    onSnapshot: (callback: DocumentCallback) => {
      data = update(callbackPath(path), concat([callback]), data)
      return () => {
        data = update(callbackPath(path), without([callback]), data)
      }
    }
  })

  const collection: (name: string) => CollectionRef = name => CollectionRef([name])

  return {
    collection
  }
}