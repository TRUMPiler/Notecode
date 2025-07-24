
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TipTapEditor from './TipTapEditor.tsx';

const EditorContainer: React.FC = () => {
  const [title, setTitle] = useState('Untitled Note');

  return (
    <div className="container mx-auto py-6 space-y-4 max-w-5xl">
      <Card className="border-border">
        <CardContent className="pt-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-2xl font-bold border-0 px-0 mb-4 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <TipTapEditor />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorContainer;