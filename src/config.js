export const normalizeConfig = config => {
  const contractEntries = Object.entries(config.contracts).map(
    ([name, value]) => {
      let newValue = value
      if (typeof newValue === 'boolean') {
        newValue = { enabled: value }
      }
      if (typeof newValue.enabled !== 'boolean') {
        newValue.enabled = true
      }
      return [name, newValue]
    }
  )

  return {
    ...config,
    contracts: Object.fromEntries(contractEntries),
  }
}
