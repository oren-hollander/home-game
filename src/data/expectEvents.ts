
type Expect = (...args: any[]) => void 

interface Expectation  {
  key: string
  expectation: Expect
}

export const Expectation = (key: string, expectation: Expect): Expectation => ({key, expectation}) 

interface ExpectationAPI {
  expect: (key: string, ...args: any[]) => void
  wait: Promise<void>
}

export const defineExpectations: (...expectations: Expectation[]) => ExpectationAPI = (...expectations) => {

  let resolvePromise: () => void
  let rejectPromise: (error: any) => void
  let callCount = 0

  const wait: Promise<void> & ExpectationAPI = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  }) as Promise<void> & ExpectationAPI
  
  const expect = (key: string, ...args: any[]) => {
    if(callCount >= expectations.length) {
      rejectPromise(`Not expecting ${key}`)
      return 
    }

    const expectation = expectations[callCount]
    if (key !== expectation.key) {
      rejectPromise(`expected ${expectation.key}, got ${key}`)
      return 
    }

    try {
      expectation.expectation(...args)
    }
    catch (e) {
      rejectPromise(e)
      return
    }

    callCount++

    if (callCount === expectations.length) {
      resolvePromise()
    }
  }

  return {
    expect,
    wait
  }
}
