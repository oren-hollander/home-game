import { HomeGameAsyncThunkAction } from '../state'
import { hasErrors, hasStatus } from './statusReducer'
import { delay } from '../../util/delay'

export const ENQUEUE_ERROR = 'status/enqueue-error'
export const DEQUEUE_ERROR = 'status/dequeue-error'
export const ENQUEUE_STATUS = 'status/enqueue-status'
export const DEQUEUE_STATUS = 'status/dequeue-status'

const enqueueError = (message: string) => ({ type: ENQUEUE_ERROR as typeof ENQUEUE_ERROR, message })
type EnqueueError = ReturnType<typeof enqueueError>

const dequeueError = () => ({ type: DEQUEUE_ERROR as typeof DEQUEUE_ERROR })
type DequeueError = ReturnType<typeof dequeueError>

const enqueueStatus = (status: string) => ({ type: ENQUEUE_STATUS as typeof ENQUEUE_STATUS, status })
type EnqueueStatus = ReturnType<typeof enqueueStatus>

const dequeueStatus = () => ({ type: DEQUEUE_STATUS as typeof DEQUEUE_STATUS })
type DequeueStatus = ReturnType<typeof dequeueStatus>

export type StatusAction = EnqueueError | DequeueError | EnqueueStatus | DequeueStatus

const hideError = (): HomeGameAsyncThunkAction => async (dispatch, getState) => {
  dispatch(dequeueError())
  if (hasErrors(getState())) {
    await delay(1000)
    dispatch(hideError())
  }
}

export const showError = (message: string): HomeGameAsyncThunkAction => async (dispatch, getState) => {
  const errorsExist = hasErrors(getState())
  dispatch(enqueueError(message))
  if (!errorsExist) {
    await delay(5000)
    dispatch(hideError())
  }
}

const hideStatus = (): HomeGameAsyncThunkAction => async (dispatch, getState) => {
  dispatch(dequeueStatus())
  if (hasStatus(getState())) {
    await delay(1000)
    dispatch(hideStatus())
  }
}

export const showStatus = (status: string): HomeGameAsyncThunkAction => async (dispatch, getState) => {
  const statusExist = hasStatus(getState())
  dispatch(enqueueStatus(status))
  if (!statusExist) {
    await delay(5000)
    dispatch(hideStatus())
  }
}

