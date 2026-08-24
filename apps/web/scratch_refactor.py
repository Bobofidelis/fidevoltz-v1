import re

file_path = r"C:\Users\fidel\OneDrive\Desktop\fidevoltz-website\apps\web\components\dashboard\pages\block-editor.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add dnd-kit imports
imports_to_add = """
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
"""

content = content.replace('import { useState } from "react";', 'import { useState } from "react";\n' + imports_to_add)

# 2. Add ID to Block interface
content = content.replace('interface Block {\n  type: string;', 'interface Block {\n  id?: string;\n  type: string;')

# 3. Add id to new blocks
content = content.replace('let newBlock: Block = { type };', 'let newBlock: Block = { id: crypto.randomUUID(), type };')

# 4. In BlockEditor, ensure all blocks have an ID, define sensors and handleDragEnd
setup_code = """
  // Ensure all blocks have IDs (for existing ones)
  const blocksWithIds = blocks.map((b, i) => b.id ? b : { ...b, id: `legacy-${i}-${b.type}` });

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
"""

content = content.replace('const [expandedIndex, setExpandedIndex] = useState<number | null>(0);', 'const [expandedIndex, setExpandedIndex] = useState<number | null>(0);\n' + setup_code)

# 5. Extract the Sortable item logic
# Wait, let's just make the whole Card mapped thing into a sub-component.
# Or better, just wrap the Card mapping in DndContext and SortableContext.
dnd_wrapper_start = """
      <div className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocksWithIds.map(b => b.id!)} strategy={verticalListSortingStrategy}>
"""

dnd_wrapper_end = """
          </SortableContext>
        </DndContext>
      </div>
"""

content = content.replace('<div className="space-y-4">', dnd_wrapper_start, 1)
content = content.replace('        {blocks.map((block, index) => (', '        {blocksWithIds.map((block, index) => (\n          <SortableBlockCard \n            key={block.id} \n            block={block} \n            index={index} \n            expandedIndex={expandedIndex} \n            setExpandedIndex={setExpandedIndex} \n            updateBlock={updateBlock} \n            moveBlock={moveBlock} \n            removeBlock={removeBlock} \n            total={blocksWithIds.length} \n          />\n        ))}\n' + dnd_wrapper_end + '\n        {/*')
content = content.replace('              <CardContent className="p-6 space-y-6">', '              <CardContent className="p-6 space-y-6">', 1)

# Now we need to grab the Card component code to put in SortableBlockCard.
# I'll just use regex to extract it or manually construct it.
