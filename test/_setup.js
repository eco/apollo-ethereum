const path = require('path')
const chai = require('chai')
const chaiJestSnapshot = require('chai-jest-snapshot')
const chaiSubset = require('chai-subset')

global.expect = chai.expect

chai.use(chaiJestSnapshot)
chai.use(chaiSubset)

before(() => chaiJestSnapshot.resetSnapshotRegistry())

// eslint-disable-next-line
beforeEach(function() {
  chaiJestSnapshot.configureUsingMochaContext(this)

  const dir = path.dirname(this.currentTest.file)
  let base = path.basename(this.currentTest.file)
  base += '.snap'

  const file = path.join(dir, 'snapshots', base)
  chaiJestSnapshot.setFilename(file)
})
