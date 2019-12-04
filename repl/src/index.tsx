import React from 'react'
import ReactDOM from 'react-dom'
// @ts-ignore
import { Provider } from 'react-redux'
import Playground, { store } from 'graphql-playground-react'
import { createEthereumLink } from 'apollo-ethereum'
import ethereumConfig from './graph'
import './index.css'

const { ethereum } = window as any
const { REACT_APP_POLICY_ADDRESS } = process.env

const createApolloLink = () => {
  const link = createEthereumLink(ethereumConfig as any, {
    provider: ethereum,
    erc1820: {
      lookupAddress: REACT_APP_POLICY_ADDRESS,
      lookupMethod: 'policyFor',
    }
  })
  return { link }
}


ReactDOM.render(
  <Provider store={store}>
    <Playground createApolloLink={createApolloLink} />
  </Provider>,
  document.getElementById('root')
)
