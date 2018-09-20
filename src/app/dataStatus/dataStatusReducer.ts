import { Reducer } from 'redux'
import { MARK_FRESH, MARK_STALE, DataStatusAction } from './dataStatusActions'
import { DataStatus } from '../../data/dataStatus'
import { HomeGameAction, State } from '../state';
import { Selector } from 'reselect';

export const dataStatusReducer = (key: string): Reducer<DataStatus, HomeGameAction> => (dataStatus = 'stale', action: DataStatusAction): DataStatus => {
  if (action.key !== key) {
    return dataStatus
  }

  switch (action.type) {
    case MARK_FRESH:
      return 'fresh'
    case MARK_STALE:
      return 'stale'
    default:
      return dataStatus
  }
}

export const getDataStatus = (key: string): Selector<State, DataStatus> => state => state[key].status
