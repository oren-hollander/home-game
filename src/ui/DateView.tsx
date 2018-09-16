import * as React from 'react'
import { SFC } from 'react'
import * as firebase from 'firebase/app'
import { format } from 'date-fns'

type Timestamp = firebase.firestore.Timestamp

interface DateProps {
  timestamp: Timestamp
}

const getTimestampData = (timestamp: Timestamp): string => format(timestamp.toDate(), 'ddd, MMM Do, h:mm a')

export const DateView: SFC<DateProps> = ({ timestamp }) => <span>{getTimestampData(timestamp)}</span>
