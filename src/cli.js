import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import yaml from 'js-yaml'
import generate from './gen'
import { normalizeConfig } from './config'

// parse CLI options
const [abiDir, outDir] = process.argv.slice(2).map(dir => path.resolve(dir))

// retrieve config
let config = yaml.safeLoad(fs.readFileSync('eth.config.yaml', 'utf8'))
config = normalizeConfig(config)

// process files from ABI directory
const abis = {}
const asts = {}
const configs = {}
Object.entries(config.contracts)
  .filter(entry => entry[1].enabled)
  .forEach(([name, contractConfig]) => {
    const pathname = path.join(abiDir, `${name}.json`)
    const json = fs.readFileSync(pathname, 'utf-8')
    const contract = JSON.parse(json)

    abis[name] = contract.abi
    asts[name] = contract.ast
    configs[name] = contractConfig
  })

// generate the contract graph
const source = generate(abis, asts, configs)

// write schema and config module
mkdirp.sync(outDir)

const graphFile = path.join(outDir, 'ethereum.graphql')
fs.writeFileSync(graphFile, source)

const configFile = path.join(outDir, 'index.js')
const configJson = JSON.stringify({ contracts: abis, source }, null, 2)
fs.writeFileSync(configFile, `module.exports = ${configJson}`)
