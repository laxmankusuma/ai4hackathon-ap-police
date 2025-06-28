
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProcessedIncident } from '@/types/incident';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Andhra Pradesh center coordinates
const AP_CENTER: [number, number] = [15.9129, 79.7400];

interface InteractiveMapProps {
  filteredIncidents: ProcessedIncident[];
  selectedDistrict: string;
  showHeatmap: boolean;
  onDistrictSelect: (district: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  filteredIncidents,
  showHeatmap
}) => {
  const getIncidentColor = (type: string) => {
      const colors = {
      "Body Offence": "red",              // violent, high-alert
      "Robbery": "purple",                // stealthy, criminal
      "Offence Against Women": "blue",    // empathy, serious
      "Accident": "orange",               // caution
      "Disaster": "brown",                // earthy, severe
      "Missing": "maroon",                // emotional, alert
      "Offence Against Public": "yellow"  // general public caution
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
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">{incident.ticketid}</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Type:</strong> {incident.type}</p>
                      <p><strong>Caller:</strong> {incident.caller_name}</p>
                      <p><strong>District:</strong> {incident.district}</p>
                      <p><strong>Severity:</strong> {incident.severity}</p>
                      <p><strong>Address:</strong> {incident.address}</p>
                      <p><strong>Officer:</strong> {incident.officer}</p>
                      <p><strong>Status:</strong> {incident.status}</p>
                      <p><strong>Time:</strong> {incident.time}</p>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ) : (
              <Marker
                position={[incident.lat, incident.lng]}
                icon={createCustomIcon(getIncidentColor(incident.type), incident.severity)}
              >
                <Popup>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">{incident.ticketid}</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Type:</strong> {incident.type}</p>
                      <p><strong>Caller:</strong> {incident.caller_name}</p>
                      <p><strong>District:</strong> {incident.district}</p>
                      <p><strong>Severity:</strong> {incident.severity}</p>
                      <p><strong>Address:</strong> {incident.address}</p>
                      <p><strong>Officer:</strong> {incident.officer}</p>
                      <p><strong>Status:</strong> {incident.status}</p>
                      <p><strong>Time:</strong> {incident.time}</p>
                    </div>
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
