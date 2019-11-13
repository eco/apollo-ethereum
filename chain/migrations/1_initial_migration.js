const Migrations = artifacts.require("Migrations")
const SimpleStorage = artifacts.require("SimpleStorage")

module.exports = async function(deployer) {
  deployer.deploy(Migrations)

  // SimpleStorage
  const simpleStorage = await deployer.deploy(SimpleStorage)
  await simpleStorage.set('42')
}
