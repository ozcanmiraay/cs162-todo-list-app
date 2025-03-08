import React from 'react';
import { useDrag } from 'react-dnd';
import TodoItem from './TodoItem';

const DraggableItem = ({ item, onUpdate, listId, depth }) => {
  // Only allow dragging top-level items (depth === 0)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TODO_ITEM',
    item: { id: item.id, sourceListId: listId, description: item.description },
    canDrag: depth === 0, // Only allow dragging top-level items
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={depth === 0 ? drag : null} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: depth === 0 ? 'grab' : 'default',
        transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}
      className={`${depth === 0 ? 'draggable-item' : ''} ${isDragging ? 'is-dragging' : ''}`}
      title={depth === 0 ? "Drag to move to another list" : ""}
    >
      <TodoItem 
        item={item} 
        onUpdate={onUpdate} 
        listId={listId} 
        depth={depth} 
      />
    </div>
  );
};

export default DraggableItem; 