import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { GraphQLFieldResolver } from 'graphql'

type CreateContractResolver = (abi: AbiItem[]) => GraphQLFieldResolver<any, any>
type CreateFieldResolver = (item: AbiItem) => GraphQLFieldResolver<any, any>
type GetFunction = (contract: any, item: AbiItem, args: any) => any

const { ethereum } = window as any
const web3 = new Web3(ethereum)

export const createContractResolver: CreateContractResolver = abi => (
  parent,
  args
) => new web3.eth.Contract(abi, args.address)

const getFunction: GetFunction = (contract, item, args) => {
  if (!item.name || !item.inputs) {
    throw new Error(
      'Missing required properties `name` and `input` on ABI Item'
    )
  }
  const fnArgs = item.inputs.map(input => args[input.name || 'key'])
  return contract.methods[item.name](...fnArgs)
}

export const createReadResolver: CreateFieldResolver = item => (
  contract,
  args
) => {
  const fn = getFunction(contract, item, args)
  return fn.call()
}

export const createWriteResolver: CreateFieldResolver = item => async (
  contract,
  args
) => {
  const fn = getFunction(contract, item, args)
  const [from] = await web3.eth.getAccounts()
  const promiEvent = fn.send({ from })
  await new Promise((resolve, reject) => {
    promiEvent.on('transactionHash', resolve)
    promiEvent.on('error', reject)
  })
  return true
}
