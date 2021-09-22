import React, {
  Context,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

type Manager<T> = {
  state: T
  dispatches: Set<Readonly<[React.Dispatch<React.SetStateAction<unknown>>, (state: T) => unknown]>>
}

type CustomContext<T> = {
  Provider: ({
    value,
    children
  }: {
    children: ReactNode
    value?: T
  }) => React.FunctionComponentElement<React.ProviderProps<Manager<T>>>
  _Provider: Context<Manager<T>>['Provider']
  Consumer: Context<T>['Consumer']
  displayName?: string | undefined
}

const createManager = <T>(state?: T) => ({
  state: state as T,
  dispatches: new Set<
    Readonly<[React.Dispatch<React.SetStateAction<unknown>>, (state: T) => unknown]>
  >()
})

const createCustomContext: {
  <T>(state: T): CustomContext<T>
  <T>(): CustomContext<T | undefined>
} = <T>(state?: T): CustomContext<T> => {
  const context = createContext<Manager<T>>(undefined as never)
  const customContext = context as unknown as CustomContext<T>
  customContext._Provider = context.Provider
  customContext.Provider = ({ value, children }: { children: ReactNode; value?: T }) => {
    const manager = useRef(createManager<T>(value || state)).current
    return React.createElement(customContext._Provider, { value: manager }, children)
  }
  return customContext
}

export const useSelector = <T, K>(context: CustomContext<T>, selector: (state: T) => K) => {
  const manager = useContext<Manager<T>>(context as unknown as Context<Manager<T>>)
  const [state, dispatch] = useState(() => selector(manager.state))
  useEffect(() => {
    const v = [dispatch as React.Dispatch<React.SetStateAction<unknown>>, selector] as const
    manager.dispatches.add(v)
    dispatch(selector(manager.state))
    return () => {
      manager.dispatches.delete(v)
    }
  }, [manager])
  return state
}
export const useDispatch = <T>(context: CustomContext<T>) => {
  const manager = useContext<Manager<T>>(context as unknown as Context<Manager<T>>)
  const { dispatches } = manager
  return (state: T | ((state: T) => T)) => {
    const newState = typeof state === 'function' ? (state as (state: T) => T)(manager.state) : state
    if (newState !== state) {
      manager.state = newState
      dispatches.forEach(([dispatch, selector]) => dispatch(selector(manager.state)))
    }
  }
}

export { createCustomContext as createContext }
