const { execute, makePromise } = require('apollo-link')
const { normalizeConfig, generate } = require('../lib/cli')
const { createEthereumLink } = require('..')

global.createClient = (_config, contracts) => {
  const config = normalizeConfig(_config)
  const input = {}
  const ethConfig = { contracts: {} }

  Object.keys(config.contracts).forEach(contractName => {
    const contract = contracts[contractName]
    input[contractName] = {
      abi: contract.abi,
      ast: contract.ast,
      config: config.contracts[contractName],
    }
    ethConfig.contracts[contractName] = contract.abi
  })

  ethConfig.source = generate(input)

  const link = createEthereumLink(ethConfig, web3.currentProvider)

  const executeEth = async (query, variables) => {
    const operation = { query, variables }
    const res = await makePromise(execute(link, operation))
    if (res.errors) {
      // eslint-disable-next-line no-console
      res.errors.forEach(e => console.error(e))
      throw new Error(`Errors occurred during graphql execution`)
    }
    return res.data
  }

  return {
    source: ethConfig.source,
    execute: executeEth,
  }
}
