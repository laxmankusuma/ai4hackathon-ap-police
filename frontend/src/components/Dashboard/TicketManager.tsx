import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MapPin,
  Phone,
  Calendar,
  Volume2,
  RefreshCw,
  AlertCircle,
  User,
  Clock
} from 'lucide-react';

export const TicketManager = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCrimeType, setFilterCrimeType] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("all");

  // API endpoint - replace with your actual endpoint URL
  const API_ENDPOINT = 'http://164.52.193.70:8000/incident_reports';

  // Fetch data from API
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching incidents:', err);

      // Fallback to mock data for demonstration
      setIncidents([
        {
          sno: 1,
          ticketid: 2024001247,
          caller_name: "Ramesh Kumar",
          caller_phone: "+91 9876543210",
          caller_gender: "Male",
          crime_type: "Theft",
          crime_subtype: "House Breaking",
          severity: 3,
          incident_date: "2024-01-15",
          incident_time: "14:30:00",
          transcribe_text: "Caller reporting a house break-in at MG Road. Multiple items stolen including electronics and jewelry.",
          description: "House break-in reported with theft of valuable items. Caller is safe but shaken.",
          address_text: "MG Road, Visakhapatnam",
          verified_address: "MG Road, Sector 5, Visakhapatnam, Andhra Pradesh",
          district: "Visakhapatnam",
          latitude: 17.6868,
          longitude: 83.2185,
          evidence_type: "Audio",
          officer_assigned: "Inspector Sharma",
          audio_file: "call_001247.mp3",
          review_status: "Processing"
        },
        {
          sno: 2,
          ticketid: 2024001246,
          caller_name: "Lakshmi Devi",
          caller_phone: "+91 9876543211",
          caller_gender: "Female",
          crime_type: "Domestic Violence",
          crime_subtype: "Physical Assault",
          severity: 5,
          incident_date: "2024-01-15",
          incident_time: "14:25:00",
          transcribe_text: "Urgent domestic violence case. Caller in immediate danger needs immediate assistance.",
          description: "Domestic violence incident requiring immediate intervention.",
          address_text: "Gandhi Nagar, Vijayawada",
          verified_address: "Gandhi Nagar, Block A, Vijayawada, Andhra Pradesh",
          district: "Vijayawada",
          latitude: 16.5062,
          longitude: 80.6480,
          evidence_type: "Audio",
          officer_assigned: "Inspector Reddy",
          audio_file: "call_001246.mp3",
          review_status: "Assigned"
        },
        {
          sno: 3,
          ticketid: 2024001245,
          caller_name: "Suresh Babu",
          caller_phone: "+91 9876543212",
          caller_gender: "Male",
          crime_type: "Traffic Violation",
          crime_subtype: "Accident",
          severity: 2,
          incident_date: "2024-01-15",
          incident_time: "14:20:00",
          transcribe_text: "Traffic accident on NH-16. Minor injuries reported. Two vehicles involved.",
          description: "Minor traffic accident with no serious injuries.",
          address_text: "NH-16, Guntur",
          verified_address: "National Highway 16, Guntur District, Andhra Pradesh",
          district: "Guntur",
          latitude: 16.3067,
          longitude: 80.4365,
          evidence_type: "Audio",
          officer_assigned: "Traffic Inspector Kumar",
          audio_file: "call_001245.mp3",
          review_status: "Resolved"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 4) return 'bg-red-100 text-red-800';
    if (severity >= 3) return 'bg-orange-100 text-orange-800';
    if (severity >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSeverityLabel = (severity) => {
    if (severity >= 4) return 'Critical';
    if (severity >= 3) return 'High';
    if (severity >= 2) return 'Medium';
    return 'Low';
  };

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch =
      incident.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.caller_phone?.includes(searchTerm) ||
      incident.address_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.ticketid?.toString().includes(searchTerm);

    const matchesStatus = filterStatus === 'all' ||
      incident.review_status?.toLowerCase() === filterStatus.toLowerCase();

    const matchesCrimeType = filterCrimeType === 'all' ||
      incident.crime_type?.toLowerCase().includes(filterCrimeType.toLowerCase());

    const matchesDistrict = filterDistrict === 'all' ||
      incident.district?.toLowerCase() === filterDistrict.toLowerCase();

    return matchesSearch && matchesStatus && matchesCrimeType && matchesDistrict;
  });

  const IncidentDetailModal = ({ incident }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Incident Report - Ticket #{incident.ticketid}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Caller Information
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                {incident.caller_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Phone className="h-3 w-3 mr-1" />
                {incident.caller_phone}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gender: {incident.caller_gender}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Incident Details
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{incident.crime_type}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{incident.crime_subtype}</p>
              <div className="flex space-x-2 mt-2">
                <Badge className={getSeverityColor(incident.severity)}>
                  {getSeverityLabel(incident.severity)}
                </Badge>
                <Badge className={getStatusColor(incident.review_status)}>
                  {incident.review_status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Date & Time
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {incident.incident_date}
              </p>
              <p className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {incident.incident_time}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Assigned Officer
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{incident.officer_assigned || 'Not Assigned'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                District: {incident.district}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Location Details
          </label>
          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="flex items-center font-medium">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {incident.verified_address || incident.address_text}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Coordinates: {incident.latitude}, {incident.longitude}
            </p>
            <div className="mt-3 h-32 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 to-blue-900 rounded flex items-center justify-center">
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Incident Description
          </label>
          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">{incident.description}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Call Transcription
          </label>
          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm italic">{incident.transcribe_text}</p>
          </div>
        </div>

        {incident.audio_file && (
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Evidence & Audio
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{incident.audio_file}</span>
                  <Badge variant="outline">{incident.evidence_type}</Badge>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading incident reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Incident Reports Management
        </h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {filteredIncidents.length} of {incidents.length} Reports
          </Badge>
          <Button onClick={fetchIncidents} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data: {error}. Showing sample data for demonstration.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by caller name, phone, ticket ID, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCrimeType} onValueChange={setFilterCrimeType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Crime Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crime Types</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="robbery">Robbery</SelectItem>
                <SelectItem value="body-offence">Body Offence</SelectItem>
                <SelectItem value="disaster">Disaster</SelectItem>
                <SelectItem value="public-offence">Offence Against Public</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="women-offence">Offence Against Women</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="srikakulam">Srikakulam</SelectItem>
                <SelectItem value="vizianagaram">Vizianagaram</SelectItem>
                <SelectItem value="parvathipuram-manyam">Parvathipuram Manyam</SelectItem>
                <SelectItem value="visakhapatnam">Visakhapatnam</SelectItem>
                <SelectItem value="anakapalli">Anakapalli</SelectItem>
                <SelectItem value="alluri-sitharama-raju">Alluri Sitharama Raju</SelectItem>
                <SelectItem value="kakinada">Kakinada</SelectItem>
                <SelectItem value="konaseema">Dr. B.R. Ambedkar Konaseema</SelectItem>
                <SelectItem value="east-godavari">East Godavari</SelectItem>
                <SelectItem value="west-godavari">West Godavari</SelectItem>
                <SelectItem value="eluru">Eluru</SelectItem>
                <SelectItem value="ntr">NTR</SelectItem>
                <SelectItem value="krishna">Krishna</SelectItem>
                <SelectItem value="guntur">Guntur</SelectItem>
                <SelectItem value="palnadu">Palnadu</SelectItem>
                <SelectItem value="bapatla">Bapatla</SelectItem>
                <SelectItem value="prakasam">Prakasam</SelectItem>
                <SelectItem value="nellore">Sri Potti Sriramulu Nellore</SelectItem>
                <SelectItem value="kurnool">Kurnool</SelectItem>
                <SelectItem value="nandyal">Nandyal</SelectItem>
                <SelectItem value="anantapur">Anantapur</SelectItem>
                <SelectItem value="sri-sathya-sai">Sri Sathya Sai</SelectItem>
                <SelectItem value="annamayya">Annamayya</SelectItem>
                <SelectItem value="ysr-kadapa">YSR Kadapa</SelectItem>
                <SelectItem value="tirupati">Tirupati</SelectItem>
                <SelectItem value="chittoor">Chittoor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Incident Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Caller
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Date/Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Crime Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Severity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident, index) => (
                  <tr key={incident.sno || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4 font-medium text-blue-600">
                      #{incident.ticketid}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{incident.caller_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {incident.caller_phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div>
                        <p>{incident.incident_date}</p>
                        <p className="text-gray-600 dark:text-gray-400">{incident.incident_time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{incident.crime_type}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {incident.crime_subtype}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div>
                        <p>{incident.district}</p>
                        <p className="text-gray-600 dark:text-gray-400 truncate max-w-32">
                          {incident.address_text}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {getSeverityLabel(incident.severity)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(incident.review_status)}>
                        {incident.review_status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <IncidentDetailModal incident={incident} />
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredIncidents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No incident reports found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};