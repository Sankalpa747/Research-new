# Pilot Components

This directory contains components specifically for the Colombo GN pilot study.

## GNSelector Component

A dropdown component for selecting GN divisions in forms.

### Basic Usage

```jsx
import GNSelector from '../components/pilot/GNSelector';

function MyForm() {
  const [selectedGN, setSelectedGN] = useState('');
  
  const handleGNChange = (gnCode, gnOption) => {
    setSelectedGN(gnCode);
    console.log('Selected:', gnCode, gnOption.label);
  };

  return (
    <GNSelector
      value={selectedGN}
      onChange={handleGNChange}
      placeholder="Select GN Division..."
      required
    />
  );
}
```

### Props

- `value` - Selected GN code (string)
- `onChange` - Callback function `(gnCode, gnOption) => void`
- `placeholder` - Placeholder text (default: "Select GN Division...")
- `required` - Show required indicator (boolean)
- `disabled` - Disable the dropdown (boolean)
- `className` - Additional CSS classes (string)
- `showPopulation` - Show population info in options (boolean)

### Data Source

The component automatically fetches GN options from `/pilot/gn-options` API endpoint.
Data comes from `data/gn_master_list.csv` file.

## usePilotData Hook

Hook for managing pilot study data.

### Usage

```jsx
import { usePilotData, useGNOptions } from '../../hooks/usePilotData';

// Full pilot data
const { gnOptions, gnList, pilotConfig, loading, error } = usePilotData();

// Just GN options (lighter)
const { gnOptions, loading, error, isValidGN } = useGNOptions();
```

## Demo

Visit `/pilot/demo` to test the GN dropdown functionality.