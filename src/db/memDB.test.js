import { DB, MemDB } from './memDB'

describe('mem db', () => {
  let memDB: DB

  beforeEach(() => {
    memDB = MemDB()
  })

  test('set and get value', async () => {
    const ref = memDB.collection('col1').doc('doc1').collection('col2').doc('doc2')
    await ref.set({x: 42})
    const value = await ref.get()
    expect(value).toEqual({x: 42})
  })
})