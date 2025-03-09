import { HTML5Backend } from 'react-dnd-html5-backend';

// Create a custom backend that extends the HTML5Backend
const CustomHTML5Backend = (manager) => {
  const backend = HTML5Backend(manager);
  
  // We don't need to override the preview anymore since we're using a custom drag layer
  return backend;
};

export default CustomHTML5Backend; 