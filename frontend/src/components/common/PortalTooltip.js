import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/Tooltip.css';

const PortalTooltip = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (isVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newPosition = position;
      let style = {};
      
      // Determine best position based on available space
      if (rect.top < 40) {
        newPosition = 'bottom';
      } else if (rect.bottom > viewportHeight - 40) {
        newPosition = 'top';
      }
      
      if (rect.left < 40) {
        newPosition = 'right';
      } else if (rect.right > viewportWidth - 40) {
        newPosition = 'left';
      }
      
      // Calculate position
      switch (newPosition) {
        case 'top':
          style = {
            bottom: (viewportHeight - rect.top) + 'px',
            left: (rect.left + rect.width / 2) + 'px',
            transform: 'translateX(-50%)'
          };
          break;
        case 'bottom':
          style = {
            top: (rect.bottom) + 'px',
            left: (rect.left + rect.width / 2) + 'px',
            transform: 'translateX(-50%)'
          };
          break;
        case 'left':
          style = {
            right: (viewportWidth - rect.left) + 'px',
            top: (rect.top + rect.height / 2) + 'px',
            transform: 'translateY(-50%)'
          };
          break;
        case 'right':
          style = {
            left: (rect.right) + 'px',
            top: (rect.top + rect.height / 2) + 'px',
            transform: 'translateY(-50%)'
          };
          break;
        default:
          break;
      }
      
      setTooltipPosition(newPosition);
      setTooltipStyle(style);
    }
  }, [isVisible, position]);
  
  return (
    <>
      <div 
        ref={containerRef}
        className="tooltip-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && ReactDOM.createPortal(
        <div 
          className={`tooltip tooltip-${tooltipPosition} tooltip-portal`}
          style={tooltipStyle}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
};

export default PortalTooltip; 