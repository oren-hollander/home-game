
type Predicate<T> = (t: T) => boolean
type PropertyGenerator<T> = () => T
type PropertyFilter<T> = (p: Predicate<T>, g: PropertyGenerator<T>) => PropertyGenerator<T>

function filter<T>(p: Predicate<T>, g: PropertyGenerator<T>): PropertyGenerator<T> {
  return () => {
    let tries = 10
    while(true){
      const property = g()
      if(p(property))
        return property
      tries--
      if(tries === 0)
        throw new Error('too many tries')
    }
  }
}

function map<T>(f: (t: T) => T, g: PropertyGenerator<T>): PropertyGenerator<T> {
  return () => f(g())
}

const randomNumberGenerator: PropertyGenerator<number> = Math.random

const rangeGenerator: (min: number, max: number) => PropertyGenerator<number> = (min: number, max: number) => () => min + Math.random() * (max - min)

// const intGenerator: (min: number, max: number) => PropertyGenerator<number> = (min, max) => () => Math.floor(numberGenerator(min, max)())
// const stringGenerator: (count)
interface Address {
  houseNumber: number,
  street: string,
  city: string
}

const fizzBuzz = filter((n: number) => n % 3 === 0 || n % 5 === 0, map(Math.floor, rangeGenerator(0, 100)))

function addressGenerator(houseNumber: PropertyGenerator<number>, street: PropertyGenerator<string>, city: PropertyGenerator<string>): PropertyGenerator<Address> {
  return () => ({
    houseNumber: houseNumber(),
    street: street(),
    city: city()
  })
}

function constantGenerator(x: any): PropertyGenerator<any> {
  return () => x
}

type Classifier<T> = (t: T) => string

function claim<T>(description: string, predicate: Predicate<T>, generator: PropertyGenerator<T>, classifier: Classifier<T> = t => ''): Claim<T> {
  return { description, predicate, generator, classifier }
}

function classifier<T>(t: T): Classifier<T> {
  return t => ''
}

interface Claim<T> {
  description: string
  predicate: Predicate<T>
  generator: PropertyGenerator<T>
  classifier: Classifier<T>
}

function check<T>(claim: Claim<T>, count: number) {
  let counter = count
  while(counter >= 0) {
    test(claim.description, () => {
      const arg = claim.generator()
      expect(claim.predicate(arg)).toBe(true)
    })
    counter--
  }
}

function test1<T>(f: (t: T) => any, claim: Claim<T>): void {

}

function test2<T1, T2>(f: (t1: T1, t2: T2) => any, claim1: Claim<T1>, claim2: Claim<T2>): void {

}

describe.skip('property ', () => {
  function f(n: number, b: boolean): number {
    return b ? n : n * 2
  }

  function nPredicate(arg: {n: number, b: boolean}): boolean {
    const {n, b} = arg
    return f(n, b) === 0
  }

  function gen(): {n: number, b: boolean} {
    return {
      n: 1,
      b: false
    }
  }

  const claim1 = claim('claim 1', nPredicate, gen)
  check(claim1, 100)
})