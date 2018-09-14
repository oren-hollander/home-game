import { Schema, deleteDocuments, getDocumentRefs } from './deleteDatabase'
import { Firestore, testConfig, signInAsAdmin } from './firestore'

describe('delete database', () => {
  test('should delete all documents', async () => {
    const firestore = Firestore(testConfig)

    const schema: Schema = {
      users: {
        friends: {},
        friendInvitations: {},
        addresses: {},
        games: {
          invitations: {},
          responses: {}
        },
        invitations: {}
      }
    }

    await signInAsAdmin()

    const refs = await getDocumentRefs(firestore.collection.bind(firestore), schema)
    await deleteDocuments(firestore, refs)
  })
})
