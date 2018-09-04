import * as firebase from 'firebase/app'
import {CallbackStore} from './callbackStore'
import { GamesDatabase } from '../db/gamesDB'

export interface Services {
  callbacks: CallbackStore
  db: GamesDatabase
  auth: firebase.auth.Auth
}