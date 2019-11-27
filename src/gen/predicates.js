const isReadFunction = item =>
  item.type === 'function' && ['view', 'pure'].includes(item.stateMutability)

const isEvent = item => item.type === 'event'

const isWriteFunction = item =>
  item.type === 'function' &&
  ['payable', 'nonpayable'].includes(item.stateMutability)

export const isQueryItem = item => isReadFunction(item) || isEvent(item)

export const isMutationItem = item => isWriteFunction(item)
