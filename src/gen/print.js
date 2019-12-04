/* eslint-disable prefer-template, no-else-return, no-use-before-define */
// modified version of schemaPrinter.js in graphql source code, which has
// been updated to allow the `directives` extension data on fields to print
// directives to the final output.
import {
  printType,
  print,
  GraphQLString,
  DEFAULT_DEPRECATION_REASON,
  isObjectType,
  astFromValue,
  isSpecifiedScalarType,
  isSpecifiedDirective,
} from 'graphql'
import { printBlockString } from 'graphql/language/blockString'

export function printSchema(schema) {
  const directives = schema
    .getDirectives()
    .filter(d => !isSpecifiedDirective(d))
    .map(printDirective)

  const types = Object.keys(schema.getTypeMap())
    .filter(name => !name.startsWith('__'))
    .map(name => schema.getType(name))
    .filter(type => !isSpecifiedScalarType(type))
    .sort((type1, type2) => type1.name.localeCompare(type2.name))
    .map(printTypeOverride)

  return directives.concat(types).join('\n\n') + '\n'
}

function printTypeOverride(type, options) {
  return isObjectType(type)
    ? printObject(type, options)
    : printType(type, options)
}

function printImplementedInterfaces(type) {
  const interfaces = type.getInterfaces()
  return interfaces.length
    ? ' implements ' + interfaces.map(i => i.name).join(' & ')
    : ''
}

function printObject(type, options) {
  return (
    printDescription(options, type) +
    `type ${type.name}` +
    printImplementedInterfaces(type) +
    printFields(options, type)
  )
}

function printFields(options, type) {
  const fields = Object.values(type.getFields()).map(
    (f, i) =>
      printDescription(options, f, '  ', !i) +
      '  ' +
      f.name +
      printArgs(options, f.args, '  ') +
      ': ' +
      String(f.type) +
      printDeprecated(f) +
      printFieldDirectives(f.extensions)
  )
  return printBlock(fields)
}

// custom added function
function printFieldDirectives(extensions = {}) {
  const { directives = {} } = extensions
  return Object.keys(directives)
    .map(directiveName => {
      let str = ' @' + directiveName
      const args = directives[directiveName]
      if (typeof args === 'object') {
        const argStr = Object.keys(args)
          .map(name => {
            return name + ': ' + print(astFromValue(args[name], GraphQLString))
          })
          .join(', ')
        str += '(' + argStr + ')'
      }
      return str
    })
    .join('')
}

function printBlock(items) {
  return items.length !== 0 ? ' {\n' + items.join('\n') + '\n}' : ''
}

function printArgs(options, args, indentation = '') {
  if (args.length === 0) {
    return ''
  }

  // If every arg does not have a description, print them on one line.
  if (args.every(arg => !arg.description)) {
    return '(' + args.map(printInputValue).join(', ') + ')'
  }

  return (
    '(\n' +
    args
      .map(
        (arg, i) =>
          printDescription(options, arg, '  ' + indentation, !i) +
          '  ' +
          indentation +
          printInputValue(arg)
      )
      .join('\n') +
    '\n' +
    indentation +
    ')'
  )
}

function printInputValue(arg) {
  const defaultAST = astFromValue(arg.defaultValue, arg.type)
  let argDecl = arg.name + ': ' + String(arg.type)
  if (defaultAST) {
    argDecl += ` = ${print(defaultAST)}`
  }
  return argDecl
}

function printDirective(directive, options) {
  return (
    printDescription(options, directive) +
    'directive @' +
    directive.name +
    printArgs(options, directive.args) +
    (directive.isRepeatable ? ' repeatable' : '') +
    ' on ' +
    directive.locations.join(' | ')
  )
}

function printDeprecated(fieldOrEnumVal) {
  if (!fieldOrEnumVal.isDeprecated) {
    return ''
  }
  const reason = fieldOrEnumVal.deprecationReason
  const reasonAST = astFromValue(reason, GraphQLString)
  if (reasonAST && reason !== DEFAULT_DEPRECATION_REASON) {
    return ' @deprecated(reason: ' + print(reasonAST) + ')'
  }
  return ' @deprecated'
}

function printDescription(options, def, indentation = '', firstInBlock = true) {
  const { description } = def
  if (description == null) {
    return ''
  }

  if (options && options.commentDescriptions) {
    return printDescriptionWithComments(description, indentation, firstInBlock)
  }

  const preferMultipleLines = description.length > 70
  const blockString = printBlockString(description, '', preferMultipleLines)
  const prefix = indentation && !firstInBlock ? '\n' + indentation : indentation

  return prefix + blockString.replace(/\n/g, '\n' + indentation) + '\n'
}

function printDescriptionWithComments(description, indentation, firstInBlock) {
  const prefix = indentation && !firstInBlock ? '\n' : ''
  const comment = description
    .split('\n')
    .map(line => indentation + (line !== '' ? '# ' + line : '#'))
    .join('\n')

  return prefix + comment + '\n'
}
