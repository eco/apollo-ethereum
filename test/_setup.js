const path = require('path')
const chai = require('chai')
const chaiJestSnapshot = require('chai-jest-snapshot')
const { execute, makePromise } = require('apollo-link')
const { normalizeConfig, generate } = require('../lib/cli')
const { createEthereumLink } = require('..')

chai.use(chaiJestSnapshot)
global.expect = chai.expect

before(() => chaiJestSnapshot.resetSnapshotRegistry())

// eslint-disable-next-line
beforeEach(function() {
  chaiJestSnapshot.configureUsingMochaContext(this)
  const dir = path.dirname(this.currentTest.file)
  const base = path.basename(this.currentTest.file)
  const file = path.join(dir, 'snapshots', base)
  chaiJestSnapshot.setFilename(file)
})

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
    return res.data
  }

  return {
    source: ethConfig.source,
    execute: executeEth,
  }
}
