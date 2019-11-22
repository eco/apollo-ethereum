import Web3 from 'web3'
import { GraphQLSchema, GraphQLFieldResolver } from 'graphql'
import { ApolloLink } from 'apollo-link'

type ContractAbiInput = ConstructorParameters<Web3['eth']['Contract']>[0]

type AbiItem = Required<Exclude<ContractAbiInput, Array<any>>>

interface AbiMap {
  [contractName: string]: AbiItem[]
}

interface LinkOptions {
  source: string
  contracts: AbiMap
}

export type CreateEthereumLink = (options: LinkOptions) => { link: ApolloLink }

export type AttachFieldResolver = (...args: any) => void

export type AttachResolvers = (schema: GraphQLSchema, contracts: AbiMap) => void

export type CreateContractResolver = (
  abi: AbiItem[]
) => GraphQLFieldResolver<any, any>

export type CreateFieldResolver = (
  item: AbiItem
) => GraphQLFieldResolver<any, any>

export type GetFunction = (contract: any, item: AbiItem, args: any) => any
