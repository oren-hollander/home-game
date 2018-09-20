export const MARK_STALE = 'data-status/mark-stale'
export const MARK_FRESH = 'data-status/mark-fresh'

export const markStale = (key: string) => ({
  type: MARK_STALE as typeof MARK_STALE,
  key
})

export const markFresh = (key: string) => ({
  type: MARK_FRESH as typeof MARK_FRESH,
  key
})

export type MarkStale = ReturnType<typeof markStale>
export type MarkFresh = ReturnType<typeof markFresh>

export type DataStatusAction = MarkStale | MarkFresh