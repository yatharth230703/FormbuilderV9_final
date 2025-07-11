import React, { useState, useEffect } from 'react';

// Assume props.options is the array of options for this step
const MultiSelectStep = ({ options, ...props }) => {
  // Initialize selected options from preselected/selected field
  const [selectedOptions, setSelectedOptions] = useState(() => {
    return options.filter(opt => opt.preselected || opt.selected).map(opt => opt.id);
  });

  useEffect(() => {
    // If options change (e.g., new form loaded), re-initialize
    const preselected = options.filter(opt => opt.preselected || opt.selected).map(opt => opt.id);
    setSelectedOptions(preselected);
  }, [options]);

  // ... existing rendering logic ...
  // When rendering each checkbox:
  // options.map(option => (
  //   <Checkbox
  //     key={option.id}
  //     checked={selectedOptions.includes(option.id)}
  //     onChange={() => {
  //       setSelectedOptions(prev =>
  //         prev.includes(option.id)
  //           ? prev.filter(id => id !== option.id)
  //           : [...prev, option.id]
  //       );
  //     }}
  //     ...otherProps
  //   />
  // ))

  // ... existing code ...
};

export default MultiSelectStep; 