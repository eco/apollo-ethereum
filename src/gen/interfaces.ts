import Web3 from 'web3'
import {
  GraphQLFieldConfigMap,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  GraphQLOutputType,
} from 'graphql'

type ContractAbiInput = ConstructorParameters<Web3['eth']['Contract']>[0]
type AbiItem = Required<Exclude<ContractAbiInput, Array<any>>>

export type AbiInput = AbiItem['inputs'][0]
export type AbiOutput = AbiItem['outputs'][0]

export type AbiItemPredicate = (item: AbiItem) => boolean

export interface AbiMap {
  [contractName: string]: AbiItem[]
}

export type Fields = GraphQLFieldConfigMap<null, null>

export type Args = GraphQLFieldConfigArgumentMap

export type TypeMap = { [key: string]: GraphQLNamedType }

export type CachedDefine = <T extends GraphQLNamedType>(
  key: string,
  defineFn: (key: string) => T
) => T

export type SolidityToGraphContract = (
  contractName: string,
  abi: AbiItem[],
  defineType: CachedDefine
) => { query: GraphQLObjectType; mutative?: GraphQLObjectType }

export type SolidityToGraphIO = <T extends boolean>(
  input: AbiInput[] | AbiOutput[],
  defineType: CachedDefine,
  isInput?: T
) => T extends true ? GraphQLFieldConfigArgumentMap : Fields

export type SolidityToGraphIOField = <T extends boolean>(
  input: AbiInput | AbiOutput,
  defineType: CachedDefine,
  isInput?: T
) => T extends true ? GraphQLInputType : GraphQLOutputType

export type TypeResolver = (size?: number) => GraphQLScalarType

export interface TypeResolverMap {
  [typeName: string]: GraphQLScalarType | TypeResolver
}

export type SolidityToGraphScalar = (
  solidityType: string,
  size?: number
) => GraphQLScalarType
