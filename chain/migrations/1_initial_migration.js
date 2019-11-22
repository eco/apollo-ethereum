const Migrations = artifacts.require('Migrations')
const SimpleStorage = artifacts.require('SimpleStorage')
const Types = artifacts.require('Types')
const Structs = artifacts.require('Structs')
const Experimental = artifacts.require('Experimental')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Migrations)
  await deployer.deploy(SimpleStorage)
  await deployer.deploy(Types)
  await deployer.deploy(Structs)
  await deployer.deploy(Experimental)

  // fixme: mint test account
  await web3.eth.sendTransaction({
    from: accounts[1],
    to: '0x1e1532f345bc62dc40242b0395479f38f4672946',
    value: web3.utils.toWei('95', 'ether'),
  })
}
