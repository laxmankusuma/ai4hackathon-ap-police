import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Ticket,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';

const API_BASE_URL = 'http://164.52.196.116:8000'; // Adjust this to your API URL

export const DashboardHome = () => {
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [crimeTypeData, setCrimeTypeData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [crimeSubtypes, setCrimeSubtypes] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Modern color palette with gradients
  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ];

  const GRADIENT_COLORS = [
    'from-red-400 to-pink-600',
    'from-cyan-400 to-blue-600',
    'from-blue-400 to-indigo-600',
    'from-green-400 to-emerald-600',
    'from-yellow-400 to-orange-600',
    'from-purple-400 to-pink-600',
    'from-indigo-400 to-purple-600',
    'from-emerald-400 to-teal-600'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchWithErrorHandling = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data concurrently
      const [
        totalIncidentsData,
        crimeTypeResponse,
        districtResponse,
        monthlyTrendResponse,
        genderResponse,
        crimeSubtypesResponse,
        recentIncidentsResponse
      ] = await Promise.all([
        fetchWithErrorHandling('/total_incidents'),
        fetchWithErrorHandling('/incidents_by_crime_type'),
        fetchWithErrorHandling('/incidents_by_district'),
        fetchWithErrorHandling('/monthly_trend'),
        fetchWithErrorHandling('/gender_distribution'),
        fetchWithErrorHandling('/common_crime_subtypes'),
        fetchWithErrorHandling('/incident_reports')
      ]);

      // Set all data
      setTotalIncidents(totalIncidentsData.total_incidents || 0);
      setCrimeTypeData(crimeTypeResponse || []);
      setDistrictData(districtResponse || []);

      // Transform monthly trend data to show month names
      const transformedMonthlyTrend = (monthlyTrendResponse || []).map(item => ({
        ...item,
        month: formatMonthName(item.month)
      }));
      setMonthlyTrend(transformedMonthlyTrend);

      setGenderDistribution(genderResponse || []);
      setCrimeSubtypes(crimeSubtypesResponse || []);
      setRecentIncidents(recentIncidentsResponse || []);

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data from server. Please check if the API is running.');
      setLoading(false);
    }
  };

  const formatMonthName = (monthString) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const refreshData = () => {
    fetchAllData();
  };

  const mostCommonCrime = crimeTypeData.length > 0 ? crimeTypeData[0] : null;
  const totalDistricts = districtData.length;
  const averageIncidentsPerDistrict = districtData.length > 0
    ? Math.round(districtData.reduce((sum, d) => sum + d.count, 0) / districtData.length)
    : 0;

  // Calculate trend percentage (simplified - comparing last two months)
  const trendPercentage = monthlyTrend.length >= 2
    ? ((monthlyTrend[monthlyTrend.length - 1].count - monthlyTrend[monthlyTrend.length - 2].count) / monthlyTrend[monthlyTrend.length - 2].count * 100)
    : 0;

  const stats = [
    {
      title: "Total Incidents",
      value: totalIncidents.toLocaleString(),
      change: `${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}% from last month`,
      icon: Shield,
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25"
    },
    {
      title: "Most Common Crime",
      value: mostCommonCrime?.crime_type || "No data",
      change: mostCommonCrime ? `${mostCommonCrime.count} cases` : "Analyzing data",
      icon: AlertTriangle,
      gradient: "from-red-500 to-pink-500",
      shadowColor: "shadow-red-500/25"
    },
    {
      title: "Active Districts",
      value: totalDistricts,
      change: "100% coverage",
      icon: MapPin,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/25"
    },
    {
      title: "Avg per District",
      value: averageIncidentsPerDistrict,
      change: "Real-time data",
      icon: TrendingUp,
      gradient: "from-purple-500 to-indigo-500",
      shadowColor: "shadow-purple-500/25"
    }
  ];

  // Transform crime type data for radial chart
  const crimeTypeRadialData = crimeTypeData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    percentage: totalIncidents > 0 ? Math.round((item.count / totalIncidents) * 100) : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-pink-500 border-l-indigo-500 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent p-2">
              Emergency Command Center
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Real-time intelligence & predictive analytics dashboard
          </p>
          <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>

          {/* Data Status and Refresh */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Database className="h-4 w-4" />
              <span>Live Data Connected</span>
              {lastUpdated && (
                <span>• Updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid with Glass Morphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`relative overflow-hidden border border-gray-200 bg-white ${stat.shadowColor} shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend - Enhanced Area Chart */}
          <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <Calendar className="h-6 w-6 text-blue-600" />
                Incident Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: '#374151',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="url(#colorIncidents)"
                      strokeWidth={3}
                      fill="url(#colorIncidents)"
                      dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Crime Types - Enhanced Pie Chart */}
          <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <PieChart className="h-6 w-6 text-purple-600" />
                Crime Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={crimeTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ crime_type, percent }) => `${crime_type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                      stroke="none"
                    >
                      {crimeTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#gradient${index % COLORS.length})`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: '#374151',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Response Time Analysis - Line Chart */}
          <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <Activity className="h-6 w-6 text-emerald-600" />
                Response Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={districtData.map((district, index) => ({
                    ...district,
                    responseTime: Math.floor(Math.random() * 15) + 5, // Mock response time data
                    efficiency: Math.floor(Math.random() * 30) + 70 // Mock efficiency percentage
                  }))}>
                    <defs>
                      <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
                    <XAxis dataKey="district" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: '#374151',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'responseTime') return [`${value} min`, 'Avg Response Time'];
                        if (name === 'efficiency') return [`${value}%`, 'Efficiency Rate'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#F59E0B', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution - Enhanced */}
          <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <Users className="h-6 w-6 text-pink-600" />
                Demographic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderDistribution}>
                    <defs>
                      <linearGradient id="genderGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
                    <XAxis dataKey="caller_gender" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: '#374151',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#genderGradient)"
                      radius={[8, 8, 0, 0]}
                      stroke="#EC4899"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crime Subtypes - Full Width Enhanced */}
        <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
              <BarChart3 className="h-7 w-7 text-indigo-600" />
              High-Priority Crime Subtypes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crimeSubtypes} margin={{ bottom: 60 }}>
                  <defs>
                    <linearGradient id="subtypeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
                  <XAxis
                    dataKey="crime_subtype"
                    stroke="#6B7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      color: '#374151',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#subtypeGradient)"
                    radius={[6, 6, 0, 0]}
                    stroke="#6366F1"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents Table */}
        {recentIncidents.length > 0 && (
          <Card className="border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-gray-800 text-xl">
                <Ticket className="h-7 w-7 text-gray-600" />
                Recent Incident Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Crime Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">District</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((incident, index) => (
                      <tr key={incident.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">#{incident.id}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                            {incident.crime_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{incident.district}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {incident.incident_date ? new Date(incident.incident_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}