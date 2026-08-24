const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/dashboard/pages/block-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add dnd-kit and createContext imports
const dndImports = `
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createContext, useContext } from 'react';

const DragContext = createContext<any>(null);

function SortableCardWrapper({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  return (
    <DragContext.Provider value={{attributes, listeners}}>
      <div ref={setNodeRef} style={style} className={isDragging ? 'shadow-2xl border-primary' : ''}>
         {children}
      </div>
    </DragContext.Provider>
  );
}

function DragHandle() {
  const { attributes, listeners } = useContext(DragContext);
  return (
    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
      <GripVertical className="h-4 w-4" />
    </div>
  );
}
`;
content = content.replace('import { useState } from "react";', `import { useState } from "react";\n${dndImports}`);

// 2. Add ID to Block interface
content = content.replace('interface Block {\n  type: string;', 'interface Block {\n  id?: string;\n  type: string;');

// 3. Add id to newBlock
content = content.replace('let newBlock: Block = { type };', 'let newBlock: Block = { id: crypto.randomUUID(), type };');

// 4. Inject Sortable logic inside BlockEditor
const dndLogic = `
  // Ensure blocks have ids
  const blocksWithIds = blocks.map((b, i) => b.id ? b : { ...b, id: \`legacy-\${i}-\${b.type}\` });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocksWithIds.findIndex((b) => b.id === active.id);
      const newIndex = blocksWithIds.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocksWithIds, oldIndex, newIndex));
    }
  };
`;
content = content.replace('const [expandedIndex, setExpandedIndex] = useState<number | null>(0);', `const [expandedIndex, setExpandedIndex] = useState<number | null>(0);\n${dndLogic}`);

// 5. Replace blocks.map with SortableContext mapping
const mapStart = `
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocksWithIds.map(b => b.id!)} strategy={verticalListSortingStrategy}>
            {blocksWithIds.map((block, index) => (
              <SortableCardWrapper key={block.id} id={block.id!}>
`;

content = content.replace('        {blocks.map((block, index) => (', mapStart);

// 6. Replace GripVertical with DragHandle
content = content.replace(/<GripVertical className="h-4 w-4 text-slate-400 cursor-move" \/>/g, '<DragHandle />');

// 7. Close tags correctly
const mapEnd = `
              </SortableCardWrapper>
            ))}
          </SortableContext>
        </DndContext>
`;
content = content.replace(`            )}
          </Card>
        ))}
      </div>`, `            )}
          </Card>
${mapEnd}      </div>`);

fs.writeFileSync(filePath, content);
console.log('Refactored successfully');
