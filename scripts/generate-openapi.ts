import { generateOpenAPIDocument } from '@trpc/openapi';
import fs from 'fs';
import path from 'path';

const openApiDocument = generateOpenAPIDocument('./server/routers.ts', {
  exportName: 'appRouter',
  title: 'TradequoteUk API',
  description: 'OpenAPI compliant REST API for TradequoteUk',
  version: '1.0.0',
  baseUrl: 'https://3000-if76bh6nl2lyswpbyvjml-6a5184b7.us2.manus.computer/api',
  docsUrl: 'https://3000-if76bh6nl2lyswpbyvjml-6a5184b7.us2.manus.computer/api/docs',
  tags: ['jobs', 'users', 'quotes', 'reviews'],
});

const outputPath = path.join(__dirname, '../openapi-spec.json');
fs.writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));

console.log(`OpenAPI spec generated at ${outputPath}`);
