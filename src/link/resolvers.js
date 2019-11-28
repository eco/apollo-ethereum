import Web3 from 'web3'

const { ethereum } = window
const web3 = new Web3(ethereum)

const normalizeName = str => str.replace(/^_+/, '')

export const createContractResolver = abi => (_parent, args) =>
  new web3.eth.Contract(abi, args.address)

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
  const promiEvent = fn.send({ from })
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
