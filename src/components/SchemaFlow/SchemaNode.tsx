
import React, { memo } from 'react';
import { Handle, Position, NodeProps, type Node } from '@xyflow/react';
import { SchemaNodeData } from '../../types/schema';
import { getTypeColor, getTypeBorderColor } from '../../lib/schema-utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Info, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

const SchemaNode = ({ data, selected }: NodeProps<Node<SchemaNodeData, 'schemaNode'>>) => {
  const isContainer = data.type === 'object' || data.type === 'array';
  
  return (
    <Card className={cn(
      "min-w-[200px] shadow-md transition-all duration-200 border-2",
      selected ? "ring-2 ring-primary border-primary" : getTypeBorderColor(data.type),
      "bg-card"
    )}>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold truncate text-sm">{data.label}</span>
            {data.required && (
              <Asterisk className="w-3 h-3 text-destructive shrink-0" />
            )}
          </div>
          <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-1.5 py-0", getTypeColor(data.type))}>
            {data.type}
          </Badge>
        </div>
        
        {data.description && (
          <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">{data.description}</span>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-muted-foreground border-2 border-background"
      />
      
      {isContainer && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary border-2 border-background"
        />
      )}
    </Card>
  );
};

export default memo(SchemaNode);
