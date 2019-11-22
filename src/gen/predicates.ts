import { AbiItemPredicate } from './interfaces'

const isReadFunction: AbiItemPredicate = item =>
  item.type === 'function' && ['view', 'pure'].includes(item.stateMutability)

const isEvent: AbiItemPredicate = item => item.type === 'event'

const isWriteFunction: AbiItemPredicate = item =>
  item.type === 'function' &&
  ['payable', 'nonpayable'].includes(item.stateMutability)

export const isQueryItem: AbiItemPredicate = item =>
  isReadFunction(item) || isEvent(item)

export const isMutationItem: AbiItemPredicate = item => isWriteFunction(item)
