import React from 'react'
import { createContext, useDispatch, useSelector } from '../libs/context'

const context = createContext({ a: 20, b: 100 })

const Component01 = () => {
  console.log('Component01')
  const a = useSelector(context, (v) => v.a)
  return <div>a:{a}</div>
}
const Component02 = () => {
  console.log('Component02')
  const b = useSelector(context, (v) => v.b)
  return <div>b:{b}</div>
}
const Component03 = () => {
  console.log('Component03')
  const dispatch = useDispatch(context)
  return (
    <div>
      <div>
        <button onClick={() => dispatch((v) => ({ ...v, a: v.a + 1 }))}>a</button>
        <button onClick={() => dispatch((v) => ({ ...v, b: v.b + 1 }))}>b</button>
      </div>
    </div>
  )
}

const Page = () => {
  return (
    <context.Provider>
      <Component01 />
      <Component02 />
      <Component03 />
    </context.Provider>
  )
}
export default Page
