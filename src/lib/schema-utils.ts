
// @ts-ignore
import generateSchema from 'generate-schema';
import { JSONSchema, JSONType } from '../types/schema';

/**
 * Converts a raw JSON object into a JSON Schema.
 */
export function jsonToSchema(json: any): JSONSchema {
  try {
    const schema = generateSchema.json('Schema', json);
    // Remove the top-level title if it's just 'Schema'
    if (schema.title === 'Schema') {
      delete schema.title;
    }
    return schema;
  } catch (error) {
    console.error('Error generating schema:', error);
    return { type: 'object' };
  }
}

/**
 * Simplifies a JSON schema for easier reading/editing.
 */
export function simplifySchema(schema: JSONSchema): JSONSchema {
  // Deep clone to avoid mutations
  const simplified = JSON.parse(JSON.stringify(schema));
  
  // Recursively remove common boilerplate if needed
  const clean = (s: any) => {
    if (typeof s !== 'object' || s === null) return;
    delete s.$schema;
    if (s.properties) {
      Object.values(s.properties).forEach(clean);
    }
    if (s.items) {
      clean(s.items);
    }
  };
  
  clean(simplified);
  return simplified;
}

/**
 * Helper to get a color based on JSON type
 */
export function getTypeColor(type: JSONType): string {
  switch (type) {
    case 'string': return 'text-green-500 bg-green-50 dark:bg-green-950/30';
    case 'number': 
    case 'integer': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30';
    case 'boolean': return 'text-purple-500 bg-purple-50 dark:bg-purple-950/30';
    case 'object': return 'text-orange-500 bg-orange-50 dark:bg-orange-950/30';
    case 'array': return 'text-pink-500 bg-pink-50 dark:bg-pink-950/30';
    case 'null': return 'text-gray-500 bg-gray-50 dark:bg-gray-950/30';
    default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950/30';
  }
}

export function getTypeBorderColor(type: JSONType): string {
  switch (type) {
    case 'string': return 'border-green-500';
    case 'number': 
    case 'integer': return 'border-blue-500';
    case 'boolean': return 'border-purple-500';
    case 'object': return 'border-orange-500';
    case 'array': return 'border-pink-500';
    case 'null': return 'border-gray-500';
    default: return 'border-gray-500';
  }
}
