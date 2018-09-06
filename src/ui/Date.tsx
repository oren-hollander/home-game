import * as React from 'react'
import { SFC } from 'react'
import { Date as GameDate } from '../db/types'

export const Date: SFC<GameDate> = ({ day, month, year }) => <> `${day}/${month}/${year}` </>