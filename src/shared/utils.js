export const modifyContract = (schema, contractName, modify) => {
  const suffixes = ['', 'Active', 'Complete']
  suffixes.forEach(suffix => {
    const type = schema.getType(`${contractName}${suffix}`)
    if (type) {
      modify(type)
    }
  })
}
