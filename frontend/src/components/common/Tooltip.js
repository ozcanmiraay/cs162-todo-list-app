import React, { useState } from 'react';
import PortalTooltip from './PortalTooltip';

/**
 * Tooltip component that displays a tooltip when hovering over its children.
 * Uses a portal to render the tooltip outside the normal DOM hierarchy.
 * 
 * @param {ReactNode} children - The element that triggers the tooltip
 * @param {string} text - The text to display in the tooltip
 * @param {string} position - The position of the tooltip (top, bottom, left, right)
 */
const Tooltip = ({ children, text, position = 'top' }) => {
  // State to track whether the tooltip is visible
  const [isVisible, setIsVisible] = useState(false);
  // Reference to the element that triggers the tooltip
  const [targetElement, setTargetElement] = useState(null);

  /**
   * Show the tooltip
   * @param {Event} e - Mouse enter event
   */
  const handleMouseEnter = (e) => {
    setTargetElement(e.currentTarget);
    setIsVisible(true);
  };

  /**
   * Hide the tooltip
   */
  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      {/* Wrap children in a span to attach mouse events */}
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </span>
      
      {/* Render the tooltip portal when visible */}
      {isVisible && targetElement && (
        <PortalTooltip
          targetElement={targetElement}
          text={text}
          position={position}
        />
      )}
    </>
  );
};

export default Tooltip; 