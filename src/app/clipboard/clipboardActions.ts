import { HomeGameThunkDispatch } from '../state'
import { SuccessStatus, showStatus } from '../status/statusActions'

export const COPY_TO_CLIPBOARD = 'clipboard/copy'

export const copyToClipboard = (text: string) => (dispatch: HomeGameThunkDispatch) => {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  textarea.value = text
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  dispatch(showStatus(SuccessStatus('invitation url copied to clipboard')))
} 