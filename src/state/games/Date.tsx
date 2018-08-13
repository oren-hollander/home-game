import * as React from 'react'
import { SFC } from 'react'
import { Date as GameDate } from '../../model/types'
import ListItemText from '@material-ui/core/ListItemText'

export const Date: SFC<GameDate> = ({ day, month, year }) => <ListItemText primary={`${day}/${month}/${year}`}/>