import React from 'react'
import ReactDOM from 'react-dom'
// @ts-ignore
import { Provider } from 'react-redux'
import Playground, { store } from 'graphql-playground-react'
import { createEthereumLink } from 'apollo-ethereum'
import ethereumConfig from './graph'
import './index.css'

const { ethereum } = window as any

const createApolloLink = () => {
  const link = createEthereumLink(ethereumConfig as any, ethereum)
  return { link }
}


ReactDOM.render(
  <Provider store={store}>
    <Playground createApolloLink={createApolloLink} />
  </Provider>,
  document.getElementById('root')
)
