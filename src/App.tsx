import React, { useState } from 'react';
import { SchemaFlow } from '@/components/SchemaFlow';
import { JSONEditor } from '@/components/JSONEditor';
import { JSONSchema } from '@/types/schema';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Workflow, 
  Github, 
  Settings, 
  HelpCircle, 
  Moon, 
  Sun,
  Share2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function App() {
  const [schema, setSchema] = useState<JSONSchema>({ type: 'object' });
  const [importSchema, setImportSchema] = useState<JSONSchema | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleImportSchema = (newSchema: JSONSchema) => {
    setImportSchema(newSchema);
    // Reset import schema after a short delay so it can be triggered again if needed
    setTimeout(() => setImportSchema(undefined), 100);
  };

  const exportSchema = () => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col h-screen w-full bg-background text-foreground ${isDarkMode ? 'dark' : ''}`}>
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <Workflow className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">SchemaFlow</h1>
              <p className="text-[10px] text-muted-foreground font-medium -mt-1">VISUAL JSON SCHEMA DESIGNER</p>
            </div>
            <Badge variant="secondary" className="ml-2 text-[10px] h-5">BETA</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" className="h-9 gap-2" onClick={exportSchema}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Left: Flow Editor */}
          <div className="flex-[2] flex flex-col min-w-0">
            <SchemaFlow 
              onSchemaChange={setSchema} 
              importSchema={importSchema} 
            />
          </div>

          {/* Right: JSON View/Import */}
          <div className="flex-1 min-w-[350px] max-w-[450px] flex flex-col min-h-0">
            <JSONEditor 
              schema={schema} 
              onImportSchema={handleImportSchema} 
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="h-8 border-t flex items-center justify-between px-6 shrink-0 bg-muted/30 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>System Ready</span>
            </div>
            <Separator orientation="vertical" className="h-3" />
            <span>Nodes: {Object.keys(schema.properties || {}).length + 1}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Documentation
            </a>
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Settings
            </a>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
