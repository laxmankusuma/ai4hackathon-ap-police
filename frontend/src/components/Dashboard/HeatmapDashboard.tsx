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
  WifiOff
} from 'lucide-react';

export const HeatmapDashboard = () => {
  const [incidents, setIncidents] = useState<ProcessedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedCrimeType, setSelectedCrimeType] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineValue, setTimelineValue] = useState([75]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

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

  // Filter incidents based on selected criteria
  const filteredIncidents = incidents.filter(incident => {
    if (selectedDistrict !== "all" && incident.district !== selectedDistrict) return false;
    if (selectedCrimeType !== "all" && incident.type !== selectedCrimeType) return false;
    return true;
  });

  const getIncidentColor = (type: string) => {
    const category = crimeTypeStats.find(cat => cat.type === type);
    return category?.color || "#6b7280";
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 px-3 py-1">
            <WifiOff className="h-3 w-3 mr-1" />
            Connection Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting...
          </Badge>
        );
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading incident data from API...</p>
          <p className="text-sm text-gray-500">
            Connecting to: http://164.52.196.116:7809/all_records
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-orange-600">
              Retry attempt {retryCount + 1}...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Andhra Pradesh Crime Heatmap Dashboard
        </h2>
        <div className="flex items-center space-x-3">
          {getConnectionStatusBadge()}
          <Badge variant="outline" className="px-3 py-1">
            {filteredIncidents.length} Active Incidents
          </Badge>
          {lastUpdated && (
            <Badge variant="outline" className="px-3 py-1 text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadIncidents()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">{error}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-red-600">
                    API Endpoint: http://164.52.196.116:7809/all_records
                  </p>
                  <p className="text-sm text-red-600">
                    Retry attempts: {retryCount}/3
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      disabled={loading || retryCount >= 3}
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
          </CardContent>
        </Card>
      )}

      {/* Show message when no data but no error */}
      {!loading && !error && incidents.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">No incident data available</p>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              The API connection is working but no incidents were returned. The database may be empty or filters may be too restrictive.
            </p>
          </CardContent>
        </Card>
      )}

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
                District ({districtStats.length} districts)
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger disabled={loading || districtStats.length === 0}>
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
                Crime Categories ({crimeTypeStats.length} types)
              </label>
              <div className="space-y-2">
                {crimeTypeStats.length > 0 ? (
                  crimeTypeStats.map((crime, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedCrimeType === crime.type || selectedCrimeType === "all"
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
                  ))
                ) : (
                  <div className="text-sm text-gray-500 p-3 text-center">
                    No crime data available
                  </div>
                )}
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
                  disabled={filteredIncidents.length === 0}
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
                    disabled={filteredIncidents.length === 0}
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
            {filteredIncidents.length > 0 ? (
              <InteractiveMap
                filteredIncidents={filteredIncidents}
                selectedDistrict={selectedDistrict}
                showHeatmap={showHeatmap}
                onDistrictSelect={setSelectedDistrict}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center space-y-3">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">No incidents to display on map</p>
                  {loading && (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                  )}
                </div>
              </div>
            )}
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
              {districtStats.length > 0 ? (
                districtStats.slice(0, 8).map((district, index) => (
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
                          {district.incidents} incidents
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.min((district.incidents / Math.max(...districtStats.map(d => d.incidents))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{district.incidents}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No district statistics available</p>
                </div>
              )}
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
              {filteredIncidents.length > 0 ? (
                filteredIncidents.slice(0, 8).map((incident, index) => (
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
                        <p className="font-medium">{incident.ticketid || `INC-${incident.id}`} - {incident.type}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {incident.district} - {incident.caller_name}
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent incidents found</p>
                  {error && (
                    <p className="text-sm mt-2">Check your connection and try refreshing</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};