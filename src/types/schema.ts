
export type JSONType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

export interface SchemaNodeData {
  label: string;
  type: JSONType;
  description?: string;
  required?: boolean;
  properties?: string[]; // For objects
  items?: string; // For arrays (reference to another node ID)
  isRoot?: boolean;
  [key: string]: any; // Index signature for React Flow compatibility
}

export interface JSONSchema {
  $schema?: string;
  type?: JSONType | JSONType[];
  title?: string;
  description?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  [key: string]: any;
}
