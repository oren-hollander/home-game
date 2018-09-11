import { filter as _filter } from 'lodash/fp'

export const first = <F, S>(tuple: [F, S]): F => tuple[0]
export const second = <F, S>(tuple: [F, S]): S => tuple[1]
