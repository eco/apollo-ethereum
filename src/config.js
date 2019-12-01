export const normalizeConfig = config => {
  const contracts = {}

  Object.entries(config.contracts).forEach(([name, value]) => {
    let newValue = value
    if (typeof newValue === 'boolean') {
      newValue = { enabled: value }
    }
    if (typeof newValue.enabled !== 'boolean') {
      newValue.enabled = true
    }
    contracts[name] = newValue
  })

  return {
    ...config,
    contracts,
  }
}
