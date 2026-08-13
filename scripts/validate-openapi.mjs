import { fileURLToPath } from 'node:url'
import path from 'node:path'
import SwaggerParser from '@apidevtools/swagger-parser'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const spec = path.join(root, 'contracts', 'openapi.yaml')

try {
  const api = await SwaggerParser.validate(spec)
  console.log(`OpenAPI OK: ${api.info.title} ${api.info.version}`)
} catch (err) {
  console.error('OpenAPI validation failed:')
  console.error(err.message || err)
  process.exit(1)
}
