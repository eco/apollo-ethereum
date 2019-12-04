import Web3 from 'web3'

let web3

const normalizeName = str => str.replace(/^_+/, '')

export const setProvider = provider => {
  web3 = new Web3(provider)
}

export const createContractResolver = abi => (_parent, args) =>
  new web3.eth.Contract(abi, args.address)

export const createContractTypeResolver = contractName => async contract => {
  const code = await web3.eth.getCode(contract.options.address)
  const hasSelfDestructed = code.toString() === '0x'
  return hasSelfDestructed ? `${contractName}Complete` : `${contractName}Active`
}

const getFunction = (contract, item, args) => {
  if (!item.name || !item.inputs) {
    throw new Error(
      'Missing required properties `name` and `inputs` on ABI Item'
    )
  }

  let fnArgs
  if (item.inputs.length === 1) {
    fnArgs = Object.values(args)
  } else {
    fnArgs = item.inputs.map(input => args[normalizeName(input.name)])
  }

  return contract.methods[item.name](...fnArgs)
}

export const createReadResolver = item => (contract, args) => {
  const fn = getFunction(contract, item, args)
  return fn.call()
}

export const createWriteResolver = item => async (contract, args) => {
  const fn = getFunction(contract, item, args)
  const [from] = await web3.eth.getAccounts()
  const gas = await fn.estimateGas({ from })
  const promiEvent = fn.send({ from, gas })
  await new Promise((resolve, reject) => {
    promiEvent.on('transactionHash', resolve)
    promiEvent.on('error', reject)
  })
  return true
}

export const createEventResolver = item => async contract => {
  const events = await contract.getPastEvents(item.name, {
    fromBlock: 0,
  })

  return events.map(e => {
    const values = {}
    item.inputs.forEach(input => {
      const key = normalizeName(input.name)
      values[key] = e.returnValues[input.name]
    })
    // return a resolver for this field, so that `getBlock` is only
    // called if the query is requesting a timestamp
    values._timestamp = async () => {
      const block = await web3.eth.getBlock(e.blockHash)
      return block.timestamp
    }
    return values
  })
}

/**
 * Directives
 */

const erc1820 = async (resolve, args, config) => {
  const interfaceHash = web3.utils.keccak256(args.interfaceName)

  const data = web3.eth.abi.encodeFunctionCall(
    {
      name: config.lookupMethod,
      type: 'function',
      inputs: [
        {
          type: 'bytes32',
          name: 'interfaceHash',
        },
      ],
    },
    [interfaceHash]
  )

  const address = await web3.eth.call({
    to: config.lookupAddress,
    data,
  })

  return resolve({
    address: web3.eth.abi.decodeParameter('address', address),
  })
}

export const directives = { erc1820 }
