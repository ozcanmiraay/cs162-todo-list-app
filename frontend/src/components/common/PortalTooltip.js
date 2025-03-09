import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/Tooltip.css';

/**
 * PortalTooltip component that renders a tooltip using a React portal.
 * This allows the tooltip to be positioned correctly regardless of
 * parent element overflow or z-index constraints.
 * 
 * @param {HTMLElement} targetElement - The element that triggers the tooltip
 * @param {string} text - The text to display in the tooltip
 * @param {string} position - The position of the tooltip (top, bottom, left, right)
 */
const PortalTooltip = ({ targetElement, text, position = 'top' }) => {
  // State to store tooltip position
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  // Create a div for the portal if it doesn't exist
  const tooltipRoot = document.getElementById('tooltip-root') || (() => {
    const root = document.createElement('div');
    root.id = 'tooltip-root';
    document.body.appendChild(root);
    return root;
  })();

  /**
   * Calculate and set the tooltip position based on the target element
   */
  useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Calculate position based on the specified position prop
      let top, left;
      
      switch (position) {
        case 'bottom':
          top = rect.bottom + scrollTop + 5;
          left = rect.left + scrollLeft + (rect.width / 2);
          break;
        case 'left':
          top = rect.top + scrollTop + (rect.height / 2);
          left = rect.left + scrollLeft - 5;
          break;
        case 'right':
          top = rect.top + scrollTop + (rect.height / 2);
          left = rect.right + scrollLeft + 5;
          break;
        case 'top':
        default:
          top = rect.top + scrollTop - 5;
          left = rect.left + scrollLeft + (rect.width / 2);
          break;
      }
      
      setTooltipPosition({ top, left, position });
    }
  }, [targetElement, position]);

  /**
   * Get CSS classes for the tooltip based on its position
   */
  const getTooltipClasses = () => {
    let classes = 'tooltip';
    
    if (tooltipPosition.position) {
      classes += ` tooltip-${tooltipPosition.position}`;
    }
    
    return classes;
  };

  /**
   * Get CSS styles for the tooltip based on its position
   */
  const getTooltipStyles = () => {
    const { top, left, position } = tooltipPosition;
    let style = { position: 'absolute' };
    
    switch (position) {
      case 'bottom':
        style.top = `${top}px`;
        style.left = `${left}px`;
        style.transform = 'translateX(-50%)';
        break;
      case 'left':
        style.top = `${top}px`;
        style.left = `${left}px`;
        style.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        style.top = `${top}px`;
        style.left = `${left}px`;
        style.transform = 'translateY(-50%)';
        break;
      case 'top':
      default:
        style.top = `${top}px`;
        style.left = `${left}px`;
        style.transform = 'translate(-50%, -100%)';
        break;
    }
    
    return style;
  };

  // Create portal to render the tooltip
  return ReactDOM.createPortal(
    <div className={getTooltipClasses()} style={getTooltipStyles()}>
      {text}
    </div>,
    tooltipRoot
  );
};

export default PortalTooltip; 