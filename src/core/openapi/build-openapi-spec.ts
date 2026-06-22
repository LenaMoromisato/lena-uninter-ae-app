import { APP_API_NAME } from '@core/constants/app';
import openapiSpec from './openapi-base.json';

type OpenApiDocument = typeof openapiSpec;

export function buildOpenApiSpec(): OpenApiDocument {
  return {
    ...openapiSpec,
    info: {
      ...openapiSpec.info,
      title: APP_API_NAME,
    },
    servers: [{ url: '/api' }],
  };
}
