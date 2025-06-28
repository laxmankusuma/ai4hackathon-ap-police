
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Andhra Pradesh center coordinates
const AP_CENTER: [number, number] = [15.9129, 79.7400];

// AP Districts with accurate coordinates
const AP_DISTRICTS = [
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, incidents: 45, region: "north" },
  { name: "Vijayawada", lat: 16.5062, lng: 80.6480, incidents: 38, region: "central" },
  { name: "Tirupati", lat: 13.6288, lng: 79.4192, incidents: 28, region: "south" },
  { name: "Guntur", lat: 16.3067, lng: 80.4365, incidents: 32, region: "central" },
  { name: "Nellore", lat: 14.4426, lng: 79.9865, incidents: 23, region: "south" },
  { name: "Kurnool", lat: 15.8281, lng: 78.0373, incidents: 19, region: "west" },
  { name: "Rajahmundry", lat: 17.0005, lng: 81.8040, incidents: 25, region: "east" },
  { name: "Anantapur", lat: 14.6819, lng: 77.6006, incidents: 21, region: "west" },
  { name: "Chittoor", lat: 13.2172, lng: 79.1003, incidents: 18, region: "south" },
  { name: "Kadapa", lat: 14.4673, lng: 78.8241, incidents: 16, region: "south" },
  { name: "Kakinada", lat: 16.9891, lng: 82.2475, incidents: 22, region: "east" },
  { name: "Eluru", lat: 16.7107, lng: 81.0952, incidents: 14, region: "central" },
  { name: "Ongole", lat: 15.5057, lng: 80.0499, incidents: 17, region: "central" }
];

const MOCK_INCIDENTS = [
  { id: 1, lat: 17.7231, lng: 83.3005, type: "Theft", severity: "Medium", time: "2 mins ago", district: "Visakhapatnam" },
  { id: 2, lat: 16.5184, lng: 80.6413, type: "Traffic Violation", severity: "Low", time: "5 mins ago", district: "Vijayawada" },
  { id: 3, lat: 13.6544, lng: 79.4202, type: "Assault", severity: "High", time: "8 mins ago", district: "Tirupati" },
  { id: 4, lat: 16.3170, lng: 80.4541, type: "Land Dispute", severity: "Medium", time: "12 mins ago", district: "Guntur" },
  { id: 5, lat: 17.0105, lng: 81.8040, type: "Public Disturbance", severity: "Low", time: "15 mins ago", district: "Rajahmundry" },
  { id: 6, lat: 14.4500, lng: 79.9900, type: "Theft", severity: "High", time: "18 mins ago", district: "Nellore" },
  { id: 7, lat: 16.9891, lng: 82.2475, type: "Assault", severity: "High", time: "20 mins ago", district: "Kakinada" },
  { id: 8, lat: 15.8281, lng: 78.0373, type: "Land Dispute", severity: "Medium", time: "22 mins ago", district: "Kurnool" }
];

interface InteractiveMapProps {
  filteredIncidents: typeof MOCK_INCIDENTS;
  selectedDistrict: string;
  showHeatmap: boolean;
  onDistrictSelect: (district: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  filteredIncidents,
  selectedDistrict,
  showHeatmap,
  onDistrictSelect
}) => {
  const getIncidentColor = (type: string) => {
    const colors = {
      "Theft": "#3b82f6",
      "Assault": "#ef4444", 
      "Land Dispute": "#f97316",
      "Traffic Violation": "#8b5cf6",
      "Public Disturbance": "#eab308"
    };
    return colors[type as keyof typeof colors] || "#6b7280";
  };

  const getSeverityRadius = (severity: string) => {
    switch (severity) {
      case "High": return 1000;
      case "Medium": return 700;
      case "Low": return 400;
      default: return 500;
    }
  };

  const createCustomIcon = (color: string, severity: string) => {
    const size = severity === 'High' ? 25 : severity === 'Medium' ? 20 : 15;
    return L.divIcon({
      html: `<div style="
        width: ${size}px; 
        height: ${size}px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>`,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  return (
    <div className="h-[700px] w-full rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
      <MapContainer 
        center={AP_CENTER} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* District Centers */}
        {AP_DISTRICTS.map((district) => (
          <Marker
            key={district.name}
            position={[district.lat, district.lng]}
            eventHandlers={{
              click: () => onDistrictSelect(district.name)
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg">{district.name}</h3>
                <p className="text-sm text-gray-600">
                  {district.incidents} active incidents
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {district.region} region
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Crime Incidents */}
        {filteredIncidents.map((incident) => (
          <React.Fragment key={incident.id}>
            {showHeatmap ? (
              <Circle
                center={[incident.lat, incident.lng]}
                radius={getSeverityRadius(incident.severity)}
                fillColor={getIncidentColor(incident.type)}
                fillOpacity={0.3}
                color={getIncidentColor(incident.type)}
                weight={2}
                opacity={0.6}
              >
                <Popup>
                  <div>
                    <h4 className="font-bold">INC-{String(incident.id).padStart(3, '0')}</h4>
                    <p><strong>Type:</strong> {incident.type}</p>
                    <p><strong>District:</strong> {incident.district}</p>
                    <p><strong>Severity:</strong> {incident.severity}</p>
                    <p><strong>Time:</strong> {incident.time}</p>
                  </div>
                </Popup>
              </Circle>
            ) : (
              <Marker
                position={[incident.lat, incident.lng]}
                icon={createCustomIcon(getIncidentColor(incident.type), incident.severity)}
              >
                <Popup>
                  <div>
                    <h4 className="font-bold">INC-{String(incident.id).padStart(3, '0')}</h4>
                    <p><strong>Type:</strong> {incident.type}</p>
                    <p><strong>District:</strong> {incident.district}</p>
                    <p><strong>Severity:</strong> {incident.severity}</p>
                    <p><strong>Time:</strong> {incident.time}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};
