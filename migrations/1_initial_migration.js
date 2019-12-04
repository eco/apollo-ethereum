const Migrations = artifacts.require('Migrations')
const SimpleStorage = artifacts.require('SimpleStorage')
const Types = artifacts.require('Types')
const Structs = artifacts.require('Structs')
const Events = artifacts.require('Events')
const Experimental = artifacts.require('Experimental')
const Coercion = artifacts.require('Coercion')
const SelfDestruct = artifacts.require('SelfDestruct')
const FooInterface = artifacts.require('FooInterface')
const Policy = artifacts.require('Policy')

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Migrations)
  await deployer.deploy(SimpleStorage)
  await deployer.deploy(Types)
  await deployer.deploy(Structs)
  const events = await deployer.deploy(Events)
  await deployer.deploy(Experimental)
  await deployer.deploy(Coercion)
  await deployer.deploy(SelfDestruct)
  const fooInterface = await deployer.deploy(FooInterface)
  const policy = await deployer.deploy(Policy)

  // trigger events
  await events.triggerWarning()
  await events.triggerError()

  // erc1920
  await policy.setInterface(web3.utils.keccak256('Foo'), fooInterface.address)

  // fixme: mint test account
  await web3.eth.sendTransaction({
    from: accounts[1],
    to: '0x1e1532f345bc62dc40242b0395479f38f4672946',
    value: web3.utils.toWei('95', 'ether'),
  })
}
