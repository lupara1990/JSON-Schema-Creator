
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JSONSchema } from '../../types/schema';
import { jsonToSchema } from '../../lib/schema-utils';
import { Copy, Check, FileJson, Wand2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JSONEditorProps {
  schema: JSONSchema;
  onImportSchema: (schema: JSONSchema) => void;
}

export function JSONEditor({ schema, onImportSchema }: JSONEditorProps) {
  const [rawJson, setRawJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvert = () => {
    try {
      setError(null);
      const parsed = JSON.parse(rawJson);
      const generatedSchema = jsonToSchema(parsed);
      onImportSchema(generatedSchema);
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Tabs defaultValue="output" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="output">Generated Schema</TabsTrigger>
          <TabsTrigger value="import">Import from JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="output" className="flex-1 mt-4 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold">JSON Schema</CardTitle>
                <CardDescription className="text-[10px]">Ready for n8n or other tools</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-8">
                {copied ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full w-full p-4 font-mono text-xs bg-muted/30">
                <pre>{JSON.stringify(schema, null, 2)}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="flex-1 mt-4 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-bold">Paste Raw JSON</CardTitle>
              <CardDescription className="text-[10px]">Paste an example response to generate a schema</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0">
              <Textarea 
                placeholder='{ "id": 1, "name": "Example" }'
                className="flex-1 font-mono text-xs resize-none"
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button onClick={handleConvert} className="w-full">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate & Import Schema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileJson className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">n8n Tip</h4>
            <p className="text-[10px] text-muted-foreground">
              Use this schema in the "JSON Schema" field of n8n nodes like "HTTP Request" or "Code" for better type safety.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
