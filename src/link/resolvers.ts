import Web3 from 'web3'
import {
  CreateContractResolver,
  GetFunction,
  CreateFieldResolver,
  CreateEventResolver,
} from './interfaces'

const { ethereum } = window as any
const web3 = new Web3(ethereum)

const normalizeName = (str: string) => str.replace(/^_+/, '') || 'key'

export const createContractResolver: CreateContractResolver = abi => (
  _parent,
  args
) => new web3.eth.Contract(abi, args.address)

const getFunction: GetFunction = (contract, item, args) => {
  if (!item.name || !item.inputs) {
    throw new Error(
      'Missing required properties `name` and `inputs` on ABI Item'
    )
  }
  const fnArgs = item.inputs.map(input => args[normalizeName(input.name)])
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

export const createEventResolver: CreateEventResolver = item => async contract => {
  const events: any[] = await contract.getPastEvents(item.name, {
    fromBlock: 0,
  })

  return events.map(e => {
    const values: any = {}
    item.inputs.forEach(input => {
      const key = normalizeName(input.name)
      values[key] = e.returnValues[input.name]
    })
    values._timestamp = async () => {
      let { timestamp: unixTs } = await web3.eth.getBlock(e.blockHash)
      if (typeof unixTs === 'string') {
        unixTs = parseInt(unixTs)
      }
      return unixTs * 1000
    }
    return values
  })
}
