import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import generate from './gen'

// parse CLI options
const [abiDir, outDir] = process.argv.slice(2).map(dir => path.resolve(dir))

// process files from ABI directory
const files = fs.readdirSync(abiDir)
const srcContracts = files.map(file => {
  const pathname = path.join(abiDir, file)
  const jsonText = fs.readFileSync(pathname, 'utf-8')
  return JSON.parse(jsonText)
})

// generate the contract graph
const contracts = srcContracts.reduce((memo, contract) => {
  return {
    ...memo,
    [contract.contractName]: contract.abi,
  }
}, {})
const source = generate(contracts)
mkdirp.sync(outDir)

// generated graph
const graphFile = path.join(outDir, 'ethereum.graphql')
fs.writeFileSync(graphFile, source)

// apollo-ethereum config module
const configFile = path.join(outDir, 'index.js')
const configJson = JSON.stringify({ contracts, source }, null, 2)
fs.writeFileSync(configFile, `module.exports = ${configJson}`)
