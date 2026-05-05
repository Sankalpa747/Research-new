# Dengue Resource Allocation - Frontend

React + Vite frontend for the Dengue Resource Allocation System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set backend API URL
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev

# Available at: http://localhost:5173
```

## 🔧 Environment Variables

Create `.env.local` file:
```bash
# Required: Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Optional: Routing service configuration  
VITE_ROUTING_PROVIDER=mock
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 📱 Key Pages

### Pilot Operations (New)
- **Pilot Dashboard**: `/pilot/dashboard` - Complete overview
- **Resource Allocation**: `/pilot/resource-allocation` - Team management
- **Route Planning**: `/pilot/route-planning` - Route optimization
- **Data Entry**: `/reports/*` - Multi-source forms

### District Level (Existing)  
- **Main Dashboard**: `/` - National overview
- **Resources**: `/resources` - Resource management
- **Hotspots**: `/hotspots` - District hotspots
- **Predictions**: `/predictions` - ML predictions
- **Map View**: `/map` - Interactive maps

## 🧪 Demo Flow

1. Start: `/pilot/dashboard` - Complete pilot overview
2. Data: `/reports` - Multi-source data entry
3. Risk: Hotspot ranking table - Algorithm explanation  
4. Resources: `/pilot/resource-allocation` - Team deployment
5. Routes: `/pilot/route-planning` - Optimized operations

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 📦 Key Dependencies

- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - API client
- **Leaflet + React-Leaflet** - Maps
- **Recharts** - Data visualization

## 🔌 Backend Integration

The frontend automatically connects to the backend API using `VITE_API_BASE_URL`. 

**API Services:**
- `src/services/api.js` - Main API client
- `src/services/routingService.js` - Routing service interface

**Key Features:**
- Automatic error handling and retry logic
- CORS-enabled requests to backend
- Real-time data fetching and updates
- Responsive design for all devices