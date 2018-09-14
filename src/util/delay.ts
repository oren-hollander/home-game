import { delay as _delay } from 'lodash/fp'

export const delay = (millis: number): Promise<void> => new Promise(_delay(millis))
