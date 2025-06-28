
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  MapPin, 
  Filter, 
  Play, 
  Pause, 
  Volume2,
  Calendar,
  Clock
} from 'lucide-react';

export const HeatmapDashboard = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedCrimeType, setSelectedCrimeType] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineValue, setTimelineValue] = useState([50]);

  const districts = [
    "All Districts", "Visakhapatnam", "Vijayawada", "Tirupati", 
    "Guntur", "Nellore", "Kurnool", "Rajahmundry"
  ];

  const crimeTypes = [
    { type: "All Types", color: "", count: 247 },
    { type: "Theft", color: "bg-blue-500", count: 89 },
    { type: "Assault", color: "bg-red-500", count: 34 },
    { type: "Land Dispute", color: "bg-orange-500", count: 45 },
    { type: "Traffic Violation", color: "bg-purple-500", count: 67 },
    { type: "Public Disturbance", color: "bg-yellow-500", count: 12 }
  ];

  const recentIncidents = [
    {
      id: "INC-001",
      type: "Theft",
      location: "MG Road, Visakhapatnam",
      time: "2 mins ago",
      severity: "Medium",
      status: "Active"
    },
    {
      id: "INC-002", 
      type: "Traffic Violation",
      location: "Benz Circle, Vijayawada",
      time: "5 mins ago",
      severity: "Low",
      status: "Resolved"
    },
    {
      id: "INC-003",
      type: "Assault",
      location: "Temple Street, Tirupati", 
      time: "8 mins ago",
      severity: "High",
      status: "Investigating"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live Crime Incident Heatmap
        </h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            Live Data
          </Badge>
          <Badge variant="outline">
            247 Active Incidents
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                District
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district, index) => (
                    <SelectItem key={index} value={district.toLowerCase().replace(' ', '-')}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Time Range
              </label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Past 1 Hour</SelectItem>
                  <SelectItem value="24h">Past 24 Hours</SelectItem>
                  <SelectItem value="7d">Past 7 Days</SelectItem>
                  <SelectItem value="30d">Past 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">
                Crime Types
              </label>
              <div className="space-y-2">
                {crimeTypes.map((crime, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                    <div className="flex items-center space-x-2">
                      {crime.color && (
                        <div className={`w-3 h-3 rounded-full ${crime.color}`} />
                      )}
                      <span className="text-sm">{crime.type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {crime.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">
                Timeline Animation
              </label>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'} Timeline
                </Button>
                <div className="px-2">
                  <Slider
                    value={timelineValue}
                    onValueChange={setTimelineValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>12:00 AM</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Heatmap */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Andhra Pradesh Crime Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 to-purple-950 rounded-lg relative overflow-hidden">
              {/* Simulated Map with Crime Pins */}
              <div className="absolute inset-0 p-4">
                {/* Visakhapatnam */}
                <div className="absolute top-16 right-20">
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse cursor-pointer" />
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-red-500/30 rounded-full animate-ping" />
                  </div>
                </div>
                
                {/* Vijayawada */}
                <div className="absolute top-32 left-32">
                  <div className="relative">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse cursor-pointer" />
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500/30 rounded-full animate-ping" />
                  </div>
                </div>
                
                {/* Tirupati */}
                <div className="absolute bottom-20 left-24">
                  <div className="relative">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse cursor-pointer" />
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-orange-500/30 rounded-full animate-ping" />
                  </div>
                </div>
                
                {/* Multiple smaller incidents */}
                <div className="absolute top-24 left-40">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse cursor-pointer" />
                </div>
                <div className="absolute top-48 right-32">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse cursor-pointer" />
                </div>
                <div className="absolute bottom-32 right-40">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse cursor-pointer" />
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
                <p className="text-sm font-medium mb-2">Legend</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-xs">High Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-xs">Medium Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-xs">Low Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIncidents.map((incident, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    incident.type === 'Theft' ? 'bg-blue-500' :
                    incident.type === 'Assault' ? 'bg-red-500' :
                    incident.type === 'Traffic Violation' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium">{incident.id} - {incident.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {incident.location}
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
  );
};
