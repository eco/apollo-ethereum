module.exports = {
  "contracts": {
    "Migrations": [
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "last_completed_migration",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "completed",
            "type": "uint256"
          }
        ],
        "name": "setCompleted",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "new_address",
            "type": "address"
          }
        ],
        "name": "upgrade",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "SimpleStorage": [
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "x",
            "type": "uint256"
          }
        ],
        "name": "set",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "get",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  "source": "scalar Address\n\nscalar BigNumber\n\ntype Migrations {\n  _address: Address!\n  last_completed_migration: BigNumber!\n  owner: Address!\n}\n\ntype MigrationsMutative {\n  setCompleted(completed: BigNumber!): Boolean!\n  upgrade(new_address: Address!): Boolean!\n}\n\ntype Mutation {\n  Migrations: MigrationsMutative\n  SimpleStorage: SimpleStorageMutative\n}\n\ntype Query {\n  Migrations(address: Address!): Migrations\n  SimpleStorage(address: Address!): SimpleStorage\n}\n\ntype SimpleStorage {\n  _address: Address!\n  get: BigNumber!\n}\n\ntype SimpleStorageMutative {\n  set(x: BigNumber!): Boolean!\n}\n"
}