import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/Tooltip.css';

const Tooltip = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef(null);
  
  useEffect(() => {
    if (isVisible && childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top, left;
      
      switch (position) {
        case 'bottom':
          top = rect.bottom + scrollTop + 15;
          left = rect.left + scrollLeft + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.left + scrollLeft - 15;
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.right + scrollLeft + 15;
          break;
        default: // top
          top = rect.top + scrollTop - 15;
          left = rect.left + scrollLeft + rect.width / 2;
      }
      
      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);
  
  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  
  const tooltipClass = `tooltip-portal tooltip-${position}`;
  
  return (
    <div 
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={childRef}>
        {children}
      </div>
      
      {isVisible && ReactDOM.createPortal(
        <div 
          className={tooltipClass}
          style={{
            position: 'absolute',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: position === 'top' || position === 'bottom' 
              ? 'translateX(-50%)' 
              : position === 'left' 
                ? 'translateX(-100%) translateY(-50%)' 
                : 'translateY(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '5px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
          }}
        >
          {text}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip; 