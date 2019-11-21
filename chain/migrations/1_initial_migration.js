const Migrations = artifacts.require("Migrations")
const Types = artifacts.require('Types')
const SimpleStorage = artifacts.require("SimpleStorage")

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Migrations)

  // Types
  await deployer.deploy(Types)

  // SimpleStorage
  const simpleStorage = await deployer.deploy(SimpleStorage)
  await simpleStorage.set('42')

  // fixme: mint test account
  await web3.eth.sendTransaction({
    from: accounts[1],
    to: '0x1e1532f345bc62dc40242b0395479f38f4672946',
    value: web3.utils.toWei('95', 'ether'),
  })
}
