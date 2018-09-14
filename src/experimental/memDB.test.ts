import { DB, MemDB, DocumentData } from './memDB'

describe('mem db', () => {
  let memDB: DB

  beforeEach(() => {
    memDB = MemDB()
  })

  test('set and get value', async () => {
    const ref = memDB
      .collection('col1')
      .doc('doc1')
      .collection('col2')
      .doc('doc2')
    await ref.set({ x: 42 } as firebase.firestore.DocumentData)
    const value = await ref.get()
    expect(value).toEqual({ x: 42 })
  })

  test('should notify listeners with current snaphshot', done => {
    const ref = memDB.collection('col1').doc('doc1')
    ref.set({ x: 42 } as DocumentData)
    ref.onSnapshot(doc => {
      expect(doc).toEqual({ x: 42 })
      done()
    })
  })

  test('should notify document listeners', async () => {
    const ref = memDB.collection('col1').doc('doc1')

    await ref.set({ x: 41 } as DocumentData)
    const listener = jest.fn()

    ref.onSnapshot(listener)

    await ref.set({ x: 42 } as DocumentData)

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledWith({ x: 41 })
    expect(listener).toHaveBeenLastCalledWith({ x: 42 })
  })

  test('should notify collection listeners', async () => {
    const colRef = memDB.collection('col1')
    const doc1Ref = colRef.doc('doc1')
    const doc2Ref = colRef.doc('doc2')

    await doc1Ref.set({ x: 41 } as DocumentData)
    await doc2Ref.set({ x: 42 } as DocumentData)

    const listener = jest.fn()

    colRef.onSnapshot(listener)

    await doc1Ref.set({ x: 43 } as DocumentData)
    await doc2Ref.set({ x: 44 } as DocumentData)

    expect(listener).toHaveBeenCalledTimes(3)
    expect(listener).toHaveBeenCalledWith([{ x: 41 }, { x: 42 }])
    expect(listener).toHaveBeenCalledWith([{ x: 43 }, { x: 42 }])
    expect(listener).toHaveBeenCalledWith([{ x: 43 }, { x: 44 }])
  })

  test('should notify emoty collection listeners', async () => {
    const colRef = memDB.collection('col1')

    const listener = jest.fn()

    colRef.onSnapshot(listener)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith([])
  })
})
