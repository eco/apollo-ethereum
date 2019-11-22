import Web3 from 'web3'
import {
  GraphQLFieldConfigMap,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
} from 'graphql'

type ContractAbiInput = ConstructorParameters<Web3['eth']['Contract']>[0]
type AbiItem = Required<Exclude<ContractAbiInput, Array<any>>>

export type AbiInput = AbiItem['inputs'][0]
export type AbiOutput = AbiItem['outputs'][0]

type ReqAbiItem = Required<AbiItem>

export type AbiItemPredicate = (item: ReqAbiItem) => boolean

export interface AbiMap {
  [contractName: string]: ReqAbiItem[]
}

export type Fields = GraphQLFieldConfigMap<null, null>

export type TypeMap = { [key: string]: GraphQLNamedType }

export type CachedDefine = <T extends GraphQLNamedType>(
  key: string,
  defineFn: (key: string) => T
) => T

export type SolidityToGraphContract = (
  contractName: string,
  abi: ReqAbiItem[],
  defineType: CachedDefine
) => { query: GraphQLObjectType; mutative?: GraphQLObjectType }

export interface SolidityToGraphIO {
  (
    input: AbiInput,
    contractName: string,
    defineType: CachedDefine,
    isInput?: boolean
  ): GraphQLInputType
  (
    output: AbiOutput,
    contractName: string,
    defineType: CachedDefine,
    isInput?: boolean
  ): GraphQLOutputType
}

export type TypeResolver = (size?: number) => GraphQLScalarType

export interface TypeResolverMap {
  [typeName: string]: GraphQLScalarType | TypeResolver
}

export type SolidityToGraphScalar = (
  solidityType: string,
  size?: number
) => GraphQLScalarType
