export enum MessageType {
  PanelMounted,
  RequestIntercepted,
  SetMockResponse,
}

export enum GraphQLOperationType {
  Query,
  Mutation,
}

const TRUE = 1
const FALSE = 0
const RANDOM = -1
const ALL_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
const NORMAL_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const INVALID_QUERY = 'invalid_query'
const INVALID_MUTATION = 'invalid_mutation'
const INTERNAL_SERVER_ERROR = 'internal_server_error'
const FIELD_NOT_FOUND = 'field_not_found'
const ERROR_GENERATING_RANDOM_RESPONSE = 'error_generating_random_response'
const SUCCESS = 'success'
const SCHEMA_INTROSPECTION_ERROR = 'schema_introspection_error'

export interface DynamicComponentData {
  dynamicExpression: string
  shouldRandomizeResponse: boolean
  shouldValidateResponse: boolean
  numberRangeStart: number
  numberRangeEnd: number
  arrayLength: number
  stringLength: number
  specialCharactersAllowed: boolean
  mockResponse: string
  statusCode: number
  responseDelay: number
  afterDecimals: number
  booleanTrue: boolean
  booleanFalse: boolean
}

export {
  TRUE,
  FALSE,
  RANDOM,
  ALL_CHARACTERS,
  NORMAL_CHARACTERS,
  INTERNAL_SERVER_ERROR,
  INVALID_QUERY,
  FIELD_NOT_FOUND,
  ERROR_GENERATING_RANDOM_RESPONSE,
  SCHEMA_INTROSPECTION_ERROR,
  SUCCESS,
  INVALID_MUTATION
}
