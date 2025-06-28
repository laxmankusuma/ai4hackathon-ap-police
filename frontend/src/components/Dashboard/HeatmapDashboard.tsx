import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { InteractiveMap } from './InteractiveMap';
import { 
  MapPin, 
  Filter, 
  Play, 
  Pause,
  Calendar,
  Clock
} from 'lucide-react';

// Updated AP Districts with accurate coordinates and boundaries
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

const CRIME_CATEGORIES = [
  { type: "All Types", color: "#6366f1", count: 265 },
  { type: "Theft", color: "#3b82f6", count: 89 },
  { type: "Assault", color: "#ef4444", count: 34 },
  { type: "Land Dispute", color: "#f97316", count: 45 },
  { type: "Traffic Violation", color: "#8b5cf6", count: 67 },
  { type: "Public Disturbance", color: "#eab308", count: 30 }
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

export const HeatmapDashboard = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedCrimeType, setSelectedCrimeType] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineValue, setTimelineValue] = useState([75]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapView, setMapView] = useState("hybrid");

  // Filter incidents based on selected criteria
  const filteredIncidents = MOCK_INCIDENTS.filter(incident => {
    if (selectedDistrict !== "all" && incident.district !== selectedDistrict) return false;
    if (selectedCrimeType !== "all" && incident.type !== selectedCrimeType) return false;
    return true;
  });

  const getIncidentColor = (type: string) => {
    const category = CRIME_CATEGORIES.find(cat => cat.type === type);
    return category?.color || "#6b7280";
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Andhra Pradesh Crime Heatmap Dashboard
        </h2>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            Live Data
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {filteredIncidents.length} Active Incidents
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Enhanced Filters Sidebar */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* District Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                District
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {AP_DISTRICTS.map((district) => (
                    <SelectItem key={district.name} value={district.name}>
                      {district.name} ({district.incidents})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Time Range
              </label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Past 1 Hour</SelectItem>
                  <SelectItem value="6h">Past 6 Hours</SelectItem>
                  <SelectItem value="24h">Past 24 Hours</SelectItem>
                  <SelectItem value="7d">Past 7 Days</SelectItem>
                  <SelectItem value="30d">Past 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Map View Controls */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Map Display
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heatmap View</span>
                  <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                </div>
              </div>
            </div>

            {/* Crime Types */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Crime Categories
              </label>
              <div className="space-y-2">
                {CRIME_CATEGORIES.map((crime, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCrimeType === crime.type.toLowerCase() || selectedCrimeType === "all"
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedCrimeType(crime.type === "All Types" ? "all" : crime.type)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: crime.color }}
                      />
                      <span className="text-sm font-medium">{crime.type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {crime.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Animation */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Timeline Animation
              </label>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'} Timeline
                </Button>
                <div className="px-1">
                  <Slider
                    value={timelineValue}
                    onValueChange={setTimelineValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interactive Map Container */}
        <Card className="xl:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Andhra Pradesh Interactive Map</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={showHeatmap ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}>
                  {showHeatmap ? "Heatmap" : "Markers"}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InteractiveMap
              filteredIncidents={filteredIncidents}
              selectedDistrict={selectedDistrict}
              showHeatmap={showHeatmap}
              onDistrictSelect={setSelectedDistrict}
            />
          </CardContent>
        </Card>
      </div>

      {/* Statistics and Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>District-wise Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AP_DISTRICTS.slice(0, 6).map((district, index) => (
                <div
                  key={district.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedDistrict(district.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{district.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {district.incidents} incidents | {district.region} region
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(district.incidents / 50) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{district.incidents}/50</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredIncidents.slice(0, 6).map((incident, index) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full animate-pulse" 
                      style={{ backgroundColor: getIncidentColor(incident.type) }}
                    />
                    <div>
                      <p className="font-medium">INC-{String(incident.id).padStart(3, '0')} - {incident.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {incident.district}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`mb-1 ${
                      incident.severity === 'High' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.severity}
                    </Badge>
                    <p className="text-sm text-gray-500">{incident.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
