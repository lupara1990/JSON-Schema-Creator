
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  OnNodesChange,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SchemaNode from './SchemaNode';
import { SchemaNodeData, JSONSchema, JSONType } from '../../types/schema';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Trash2, Code, LayoutGrid, Settings2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const nodeTypes = {
  schemaNode: SchemaNode,
};

const initialNodes: Node<SchemaNodeData>[] = [
  {
    id: 'root',
    type: 'schemaNode',
    position: { x: 250, y: 100 },
    data: { label: 'root', type: 'object', isRoot: true, description: 'Root object' },
  },
];

const initialEdges: Edge[] = [];

interface SchemaFlowProps {
  onSchemaChange: (schema: JSONSchema) => void;
  importSchema?: JSONSchema;
}

export function SchemaFlow({ onSchemaChange, importSchema }: SchemaFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNode = useMemo(() => 
    nodes.find(n => n.id === selectedNodeId), 
    [nodes, selectedNodeId]
  );

  const updateNodeData = useCallback((id: string, newData: Partial<SchemaNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Convert Flow to JSON Schema
  const generateSchemaFromFlow = useCallback(() => {
    const rootNode = nodes.find((n) => n.data.isRoot);
    if (!rootNode) return {};

    const buildSchema = (nodeId: string): JSONSchema => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return {};

      const schema: JSONSchema = {
        type: node.data.type,
      };

      if (node.data.description) {
        schema.description = node.data.description;
      }

      if (node.data.type === 'object') {
        const childEdges = edges.filter((e) => e.source === nodeId);
        if (childEdges.length > 0) {
          schema.properties = {};
          const required: string[] = [];
          
          childEdges.forEach((edge) => {
            const childNode = nodes.find((n) => n.id === edge.target);
            if (childNode && schema.properties) {
              schema.properties[childNode.data.label] = buildSchema(childNode.id);
              if (childNode.data.required) {
                required.push(childNode.data.label);
              }
            }
          });

          if (required.length > 0) {
            schema.required = required;
          }
        }
      } else if (node.data.type === 'array') {
        const childEdge = edges.find((e) => e.source === nodeId);
        if (childEdge) {
          schema.items = buildSchema(childEdge.target);
        }
      }

      return schema;
    };

    return buildSchema(rootNode.id);
  }, [nodes, edges]);

  useEffect(() => {
    const schema = generateSchemaFromFlow();
    onSchemaChange(schema);
  }, [nodes, edges, generateSchemaFromFlow, onSchemaChange]);

  // Handle Import
  useEffect(() => {
    if (importSchema) {
      const newNodes: Node<SchemaNodeData>[] = [];
      const newEdges: Edge[] = [];
      let idCounter = 0;

      const traverse = (schema: JSONSchema, label: string, parentId: string | null, x: number, y: number, isRoot = false) => {
        const id = isRoot ? 'root' : `node-${idCounter++}`;
        const type = Array.isArray(schema.type) ? schema.type[0] : (schema.type || 'object') as JSONType;
        
        newNodes.push({
          id,
          type: 'schemaNode',
          position: { x, y },
          data: { 
            label, 
            type, 
            description: schema.description,
            isRoot,
            required: false 
          },
        });

        if (parentId) {
          newEdges.push({
            id: `e-${parentId}-${id}`,
            source: parentId,
            target: id,
          });
        }

        if (type === 'object' && schema.properties) {
          Object.entries(schema.properties).forEach(([key, value], index) => {
            traverse(value as JSONSchema, key, id, x + 300, y + (index * 150), false);
          });
        } else if (type === 'array' && schema.items) {
          traverse(schema.items as JSONSchema, 'items', id, x + 300, y, false);
        }
      };

      traverse(importSchema, 'root', null, 100, 100, true);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [importSchema, setNodes, setEdges]);

  const addNode = useCallback((type: JSONType) => {
    const id = `node-${Date.now()}`;
    const newNode: Node<SchemaNodeData> = {
      id,
      type: 'schemaNode',
      position: { x: 400, y: 200 },
      data: { label: `new_${type}`, type },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected && !n.data.isRoot));
    setEdges((eds) => eds.filter((e) => !e.selected));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-background border rounded-xl overflow-hidden relative group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left" className="flex flex-col gap-2 bg-background/80 backdrop-blur p-2 rounded-lg border shadow-sm">
          <div className="text-xs font-bold text-muted-foreground mb-1 px-1">ADD NODES</div>
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" size="sm" onClick={() => addNode('object')} className="h-8 text-[10px]">Object</Button>
            <Button variant="outline" size="sm" onClick={() => addNode('array')} className="h-8 text-[10px]">Array</Button>
            <Button variant="outline" size="sm" onClick={() => addNode('string')} className="h-8 text-[10px]">String</Button>
            <Button variant="outline" size="sm" onClick={() => addNode('number')} className="h-8 text-[10px]">Number</Button>
            <Button variant="outline" size="sm" onClick={() => addNode('boolean')} className="h-8 text-[10px]">Boolean</Button>
            <Button variant="outline" size="sm" onClick={() => addNode('null')} className="h-8 text-[10px]">Null</Button>
          </div>
          <Button variant="destructive" size="sm" onClick={deleteSelected} className="mt-2 h-8">
            <Trash2 className="w-3 h-3 mr-2" /> Delete Selected
          </Button>
        </Panel>

        {/* Node Editor Panel */}
        {selectedNode && (
          <Panel position="bottom-right" className="m-4">
            <Card className="w-72 shadow-xl border-2 border-primary/20">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <Settings2 className="w-3 h-3" />
                  Edit Node: {selectedNode.data.label}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNodeId(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="node-label" className="text-[10px] uppercase font-bold text-muted-foreground">Property Name</Label>
                  <Input 
                    id="node-label"
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    className="h-8 text-xs"
                    disabled={selectedNode.data.isRoot}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="node-desc" className="text-[10px] uppercase font-bold text-muted-foreground">Description</Label>
                  <Textarea 
                    id="node-desc"
                    value={selectedNode.data.description || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                    className="text-xs min-h-[60px] resize-none"
                    placeholder="Describe this property..."
                  />
                </div>

                {!selectedNode.data.isRoot && (
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                    <Label htmlFor="node-required" className="text-xs cursor-pointer">Required Field</Label>
                    <Switch 
                      id="node-required"
                      checked={selectedNode.data.required}
                      onCheckedChange={(checked) => updateNodeData(selectedNode.id, { required: checked })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default function SchemaFlowWrapper(props: SchemaFlowProps) {
  return (
    <ReactFlowProvider>
      <SchemaFlow {...props} />
    </ReactFlowProvider>
  );
}
