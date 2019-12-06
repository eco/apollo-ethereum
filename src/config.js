/* eslint-disable no-param-reassign */

export const normalizeConfig = config => {
  const { contracts } = config

  Object.entries(contracts).forEach(([name, contract]) => {
    if (typeof contract === 'boolean') {
      contract = { enabled: contract }
    }

    if (typeof contract.enabled !== 'boolean') {
      contract.enabled = true
    }

    if (contract.fields) {
      const { fields } = contract

      Object.entries(fields).forEach(([fieldname, field]) => {
        if (typeof field === 'string') {
          field = { type: field }
        }

        fields[fieldname] = field
      })
    }

    contracts[name] = contract
  })

  return config
}
