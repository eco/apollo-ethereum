import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import generate from '../generate'

// parse CLI options
const [abiDir, outDir] = process.argv.slice(2).map(dir => path.resolve(dir))

// process files from ABI directory
const files = fs.readdirSync(abiDir)
const contracts = files.map(file => {
  const pathname = path.join(abiDir, file)
  const jsonText = fs.readFileSync(pathname, 'utf-8')
  return JSON.parse(jsonText)
})

// generate the contract graph
const output = generate(contracts)

// write generated graph to output directory
mkdirp.sync(outDir)
const outfile = path.join(outDir, 'ethereum.graphql')
fs.writeFileSync(outfile, output)
