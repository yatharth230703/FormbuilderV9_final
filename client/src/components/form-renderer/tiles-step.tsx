import React, { useState, useEffect } from 'react';

// Assume props.options is the array of options for this step
const TilesStep = ({ options, ...props }) => {
  // Initialize selected option from preselected/selected field
  const [selectedOption, setSelectedOption] = useState(() => {
    const preselected = options.find(opt => opt.preselected || opt.selected);
    return preselected ? preselected.id : null;
  });

  useEffect(() => {
    // If options change (e.g., new form loaded), re-initialize
    const preselected = options.find(opt => opt.preselected || opt.selected);
    if (preselected && preselected.id !== selectedOption) {
      setSelectedOption(preselected.id);
    }
  }, [options]);

  // ... existing rendering logic ...
  // When rendering each tile:
  // options.map(option => (
  //   <Tile
  //     key={option.id}
  //     selected={selectedOption === option.id}
  //     onClick={() => setSelectedOption(option.id)}
  //     ...otherProps
  //   />
  // ))

  // ... existing code ...
};

export default TilesStep; 