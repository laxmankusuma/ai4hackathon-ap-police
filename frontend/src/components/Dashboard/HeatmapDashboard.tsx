import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { InteractiveMap } from './InteractiveMap';
import { fetchIncidents, fetchIncidentsAlternative, getDistrictStats, getCrimeTypeStats } from '@/services/incidentService';
import { ProcessedIncident } from '@/types/incident';
import {
  MapPin,
  Filter,
  Play,
  Pause,
  Calendar,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  WifiOff,
  Settings,
  BarChart3,
  X
} from 'lucide-react';

interface HeatmapDashboardProps {
  sidebarOpen?: boolean;
}


export const HeatmapDashboard = ({ sidebarOpen = true }: HeatmapDashboardProps) => {
  const [incidents, setIncidents] = useState<ProcessedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [selectedCrimeType, setSelectedCrimeType] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineValue, setTimelineValue] = useState([75]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Active panel state - only one can be open at a time
  const [activePanel, setActivePanel] = useState<'filters' | 'controls' | 'stats' | null>(null);

  // Load incidents data with improved error handling
  const loadIncidents = async (useAlternative: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('loading');

      console.log(`Attempting to fetch incidents (attempt ${retryCount + 1})...`);

      const data = useAlternative ?
        await fetchIncidentsAlternative() :
        await fetchIncidents();

      if (data && data.length > 0) {
        setIncidents(data);
        setConnectionStatus('connected');
        setLastUpdated(new Date());
        setRetryCount(0);
        console.log(`Successfully loaded ${data.length} incidents from API`);
      } else {
        console.warn('API returned empty or invalid data');
        setIncidents([]);
        setConnectionStatus('error');
        setError('No incident data available from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch incidents:', err);
      setConnectionStatus('error');
      setRetryCount(prev => prev + 1);

      // Try alternative method if main method fails and we haven't tried it yet
      if (!useAlternative && retryCount < 2) {
        console.log('Trying alternative fetch method...');
        setTimeout(() => loadIncidents(true), 1000);
        return;
      }

      // Set user-friendly error messages
      if (err.message.includes('Network error') || err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.message.includes('JSON') || err.message.includes('parse')) {
        setError('Server returned invalid data format. The API may be experiencing issues.');
      } else if (err.message.includes('404') || err.message.includes('500')) {
        setError('Server error occurred. The API endpoint may be temporarily unavailable.');
      } else {
        setError(err.message || 'An unexpected error occurred while loading incident data.');
      }

      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  // Retry mechanism
  const handleRetry = () => {
    if (retryCount < 3) {
      loadIncidents();
    } else {
      setError('Maximum retry attempts reached. Please try again later or contact support.');
    }
  };

  // Handle panel toggle - close others when opening one
  const togglePanel = (panel: 'filters' | 'controls' | 'stats') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Auto-refresh every 5 minutes if connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(() => {
        console.log('Auto-refreshing incident data...');
        loadIncidents();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  // Calculate stats from actual data with error handling
  const districtStats = incidents.length > 0 ? getDistrictStats(incidents) : [];
  const crimeTypeStats = incidents.length > 0 ? getCrimeTypeStats(incidents) : [];

  // Add this helper function to filter incidents by time range
  const filterIncidentsByTimeRange = (incidents: ProcessedIncident[], timeRange: string) => {
    const now = new Date();
    const cutoffTime = new Date();

    switch (timeRange) {
      case '1h':
        cutoffTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        cutoffTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        cutoffTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoffTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffTime.setDate(now.getDate() - 30);
        break;
      default:
        return incidents; // 'all' case
    }

    return incidents.filter(incident => {
      console.log(incident)
      // Assuming incident.time is a string, you'll need to parse it to Date
      const incidentTime = new Date(incident.time); // Adjust parsing based on your time format
      return incidentTime >= cutoffTime;
    });
  };

  // Filter incidents based on selected criteria
  const filteredIncidents = incidents.filter(incident => {
    if (selectedDistrict !== "all" && incident.district !== selectedDistrict) return false;
    if (selectedCrimeType !== "all" && incident.type !== selectedCrimeType) return false;
    return true;
  }).filter(incident => {
    // Apply time range filter
    if (selectedTimeRange === "all") return true;
    return filterIncidentsByTimeRange([incident], selectedTimeRange).length > 0;
  });

  const getIncidentColor = (type: string) => {
    const category = crimeTypeStats.find(cat => cat.type === type);
    return category?.color || "#6b7280";
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-500/20 text-green-200 border-green-500/30 backdrop-blur-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/20 text-red-200 border-red-500/30 backdrop-blur-sm">
            <WifiOff className="h-3 w-3 mr-1" />
            Connection Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 backdrop-blur-sm">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting...
          </Badge>
        );
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6 p-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-400 relative z-10" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-100">Loading Crime Data</p>
            <p className="text-blue-300">
              Connecting to: http://164.52.196.116:7809/all_records
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-orange-300">
                Retry attempt {retryCount + 1}...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* Full-screen map container */}
      <div className="absolute inset-0">
        {filteredIncidents.length > 0 ? (
          <InteractiveMap
            filteredIncidents={filteredIncidents}
            selectedDistrict={selectedDistrict}
            showHeatmap={showHeatmap}
            onDistrictSelect={setSelectedDistrict}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center space-y-4 p-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto" />
              <p className="text-gray-100 text-xl">No incidents to display on map</p>
              {loading && (
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Header - Fixed width when sidebar is closed */}
      <div className={`absolute top-4 z-[9999] transition-all duration-300 ${sidebarOpen ? 'left-[280px] right-4' : 'left-20 right-4'
        }`}>
        <div className="flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h1 className="text-xl font-bold text-gray-100">
                Andhra Pradesh Crime Dashboard
              </h1>
            </div>
            {getConnectionStatusBadge()}
          </div>

          <div className="flex items-center space-x-3">
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 backdrop-blur-sm">
              {filteredIncidents.length} Active Incidents
            </Badge>
            {lastUpdated && (
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 backdrop-blur-sm text-xs">
                Updated: {lastUpdated.toLocaleTimeString()}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadIncidents()}
              disabled={loading}
              className="bg-gray-800/80 border-gray-600/50 text-gray-100 hover:bg-gray-700/80 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner - Responsive to sidebar state */}
      {error && (
        <div className={`absolute top-20 z-[9998] transition-all duration-300 ${sidebarOpen ? 'left-[280px] right-4' : 'left-4 right-4'
          }`}>
          <div className="p-4 bg-red-900/80 backdrop-blur-lg rounded-2xl border border-red-700/50 shadow-2xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-200">{error}</p>
                <div className="mt-3 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={loading || retryCount >= 3}
                    className="bg-red-800/50 border-red-600/50 text-red-200 hover:bg-red-700/50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Retry Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Center Control Buttons - Responsive to sidebar */}
      <div className={`absolute bottom-6 z-[9997] transition-all duration-300 ${sidebarOpen ? 'left-1/2 transform -translate-x-1/2 ml-[140px]' : 'left-1/2 transform -translate-x-1/2'
        }`}>
        <div className="flex items-center space-x-3 bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl p-2">
          <Button
            onClick={() => togglePanel('filters')}
            className={`w-12 h-12 rounded-xl transition-all duration-200 ${activePanel === 'filters'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white'
              }`}
          >
            <Filter className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => togglePanel('controls')}
            className={`w-12 h-12 rounded-xl transition-all duration-200 ${activePanel === 'controls'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white'
              }`}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => togglePanel('stats')}
            className={`w-12 h-12 rounded-xl transition-all duration-200 ${activePanel === 'stats'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white'
              }`}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Floating Filters Panel - Reduced size */}
      <div className={`absolute bottom-24 z-[9996] transition-all duration-300 ${sidebarOpen ? 'left-1/2 transform -translate-x-1/2 ml-[140px]' : 'left-1/2 transform -translate-x-1/2'
        } ${activePanel === 'filters' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <Card className="w-80 max-h-[50vh] bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 text-gray-100 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-blue-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(null)}
                className="text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="items-center space-y-3 no-scrollbar overflow-y-auto max-h-[40vh] pr-2">
            {/* District Filter */}
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1 block">
                District ({districtStats.length} districts)
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-gray-100 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtStats.map((district) => (
                    <SelectItem key={district.name} value={district.name}>
                      {district.name} ({district.incidents})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1 block">
                Time Range
              </label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-gray-100 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem> {/* Add this line */}
                  <SelectItem value="1h">Past 1 Hours</SelectItem>
                  <SelectItem value="6h">Past 6 Hours</SelectItem>
                  <SelectItem value="24h">Past 24 Hours</SelectItem>
                  <SelectItem value="7d">Past 7 Days</SelectItem>
                  <SelectItem value="30d">Past 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Crime Types */}
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1 block">
                Crime Categories ({crimeTypeStats.length} types)
              </label>
              <div className="space-y-1 max-h-32 no-scrollbar overflow-y-auto">
                {crimeTypeStats.length > 0 ? (
                  crimeTypeStats.map((crime, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-all text-xs ${selectedCrimeType === crime.type || selectedCrimeType === "all"
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-gray-800/50'
                        }`}
                      onClick={() => setSelectedCrimeType(crime.type === "All Types" ? "all" : crime.type)}
                    >
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: crime.color }}
                        />
                        <span className="text-xs">{crime.type}</span>
                      </div>
                      <Badge className="bg-gray-800/50 text-gray-300 text-xs px-1 py-0">
                        {crime.count}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 p-2 text-center">
                    No crime data available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Controls Panel - Reduced size */}
      <div className={`absolute bottom-24 z-[9995] transition-all duration-300 ${sidebarOpen ? 'left-1/2 transform -translate-x-1/2 ml-[140px]' : 'left-1/2 transform -translate-x-1/2'
        } ${activePanel === 'controls' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <Card className="w-80 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 text-gray-100 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-blue-400" />
                <span>Display Mode</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(null)}
                className="text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Map View Controls */}
            <div>
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-xs">Heatmap View</span>
                <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
              </div>
            </div>

            {/* Timeline Animation */}

          </CardContent>
        </Card>
      </div>

      {/* Floating Stats Panel - Reduced size with proper scrolling */}
      <div className={`absolute bottom-24 z-[9994] transition-all duration-300 ${sidebarOpen ? 'left-1/2 transform -translate-x-1/2 ml-[140px]' : 'left-1/2 transform -translate-x-1/2'
        } ${activePanel === 'stats' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <Card className="w-80 max-h-[50vh] bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 text-gray-100 shadow-2xl flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span>Statistics</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(null)}
                className="text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 no-scrollbar overflow-y-auto flex-1 pr-2">
            {/* District Statistics */}
            <div>
              <h3 className="text-xs font-medium text-gray-300 mb-1">Top Districts</h3>
              <div className="space-y-1">
                {districtStats.length > 0 ? (
                  districtStats.slice(0, 5).map((district, index) => (
                    <div
                      key={district.name}
                      className="flex items-center justify-between p-1.5 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDistrict(district.name)}
                    >
                      <div className="flex items-center space-x-1.5">
                        <div className="text-xs font-bold text-blue-400">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{district.name}</p>
                          <p className="text-xs text-gray-400">{district.incidents} incidents</p>
                        </div>
                      </div>
                      <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                          style={{ width: `${Math.min((district.incidents / Math.max(...districtStats.map(d => d.incidents))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400">
                    <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-xs">No district data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Incidents */}
            <div>
              <h3 className="text-xs font-medium text-gray-300 mb-1">Recent Incidents</h3>
              <div className="space-y-1">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.slice(0, 5).map((incident, index) => (
                    <div
                      key={incident.id}
                      className="p-1.5 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getIncidentColor(incident.type) }}
                          />
                          <span className="text-xs font-medium">{incident.type}</span>
                        </div>
                        <Badge className={`text-xs px-1 py-0 ${incident.severity === 'High' ? 'bg-red-500/20 text-red-300' :
                          incident.severity === 'Medium' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center">
                        <MapPin className="h-2 w-2 mr-1" />
                        {incident.district} • {incident.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400">
                    <Calendar className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-xs">No recent incidents</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Time Badge */}
      <div className="absolute bottom-4 right-4 z-[9993]">
        <Badge className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 text-gray-100 p-2 shadow-2xl text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {new Date().toLocaleTimeString()}
        </Badge>
      </div>
    </div>
  );
};