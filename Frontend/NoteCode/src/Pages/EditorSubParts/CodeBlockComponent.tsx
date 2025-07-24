import React, { useState } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { toast } from 'sonner';

type Language = {
  name: string;
  value: string;
};

const languages: Language[] = [
  { name: 'Plain Text', value: 'text' },
  { name: 'Python', value: 'python' },
  { name: 'JavaScript', value: 'javascript' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'Java', value: 'java' },
  { name: 'C++', value: 'cpp' },
  { name: 'HTML', value: 'html' },
  { name: 'CSS', value: 'css' },
  { name: 'SQL', value: 'sql' },
];

const CodeBlockComponent: React.FC<NodeViewProps> = ({
  node,
  getPos,
  editor,
  updateAttributes,
}) => {
  const language = node.attrs.language || 'text';
  
  const selectLanguage = (value: string) => {
    updateAttributes({ language: value });
  };

  const runCode = () => {
    const code = node.textContent;
    
    // This is just a placeholder - in a real implementation,
    // you would send the code to a backend service or use a WASM runtime
    toast.info(`Running ${language} code`, {
      description: "Code execution is a placeholder in this demo",
    });
    console.log(`Running ${language} code:`, code);
  };

  return (
    <NodeViewWrapper className="code-block relative my-4">
      <div className="code-block-tools">
        <Select value={language} onValueChange={selectLanguage}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button size="sm" variant="outline" onClick={runCode} className="h-8">
          <Play className="h-3.5 w-3.5 mr-1" />
          Run
        </Button>
      </div>
      <pre className={`language-${language}`}>
        <code>{node.textContent}</code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;