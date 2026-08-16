import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

/**
 * Interactive API documentation rendered from the live OpenAPI spec at /api/openapi.json.
 * @returns Swagger UI panel
 */
export function ApiDocsPage() {
  return (
    <div className="api-docs-tab">
      <SwaggerUI url="/api/openapi.json" />
    </div>
  );
}
