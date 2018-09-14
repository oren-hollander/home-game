import { HomeGameAsyncThunkAction } from '../state'
import { hasStatus, StatusMessage } from './statusReducer'
import { delay } from '../../util/delay'

export const ENQUEUE_STATUS = 'status/enqueue-status'
export const DEQUEUE_STATUS = 'status/dequeue-status'

const enqueueStatus = (status: StatusMessage) => ({ type: ENQUEUE_STATUS as typeof ENQUEUE_STATUS, status })
type EnqueueStatus = ReturnType<typeof enqueueStatus>

const dequeueStatus = () => ({ type: DEQUEUE_STATUS as typeof DEQUEUE_STATUS })
type DequeueStatus = ReturnType<typeof dequeueStatus>

export type StatusAction = EnqueueStatus | DequeueStatus

export const ErrorStatus = (text: string): StatusMessage => ({
  type: 'error',
  text
})

export const SuccessStatus = (text: string): StatusMessage => ({
  type: 'success',
  text
})

export const WarningStatus = (text: string): StatusMessage => ({
  type: 'warning',
  text
})
export const InfoStatus = (text: string): StatusMessage => ({
  type: 'info',
  text
})

const hideStatus = (): HomeGameAsyncThunkAction => async (dispatch, getState) => {
  dispatch(dequeueStatus())
  if (hasStatus(getState())) {
    await delay(3000)
    dispatch(hideStatus())
  }
}

export const showStatus = (status: StatusMessage): HomeGameAsyncThunkAction => async (dispatch, getState) => {
  const statusExist = hasStatus(getState())
  dispatch(enqueueStatus(status))
  if (!statusExist) {
    await delay(3000)
    dispatch(hideStatus())
  }
}
