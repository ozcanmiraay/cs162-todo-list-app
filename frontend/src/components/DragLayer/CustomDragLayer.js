import React from 'react';
import { useDragLayer } from 'react-dnd';
import '../../styles/DragLayer.css';

const CustomDragLayer = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || itemType !== 'TODO_ITEM') {
    return null;
  }

  // Calculate transform style
  const getItemStyles = (initialOffset, currentOffset) => {
    if (!initialOffset || !currentOffset) {
      return { display: 'none' };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;

    return {
      transform,
      WebkitTransform: transform,
    };
  };

  return (
    <div className="custom-drag-layer">
      <div className="drag-item" style={getItemStyles(initialOffset, currentOffset)}>
        <div className="drag-item-content">
          <span className="drag-item-checkbox"></span>
          <span className="drag-item-text">{item.description}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomDragLayer; 