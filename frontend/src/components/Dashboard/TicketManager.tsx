
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MapPin,
  Phone,
  Calendar,
  Volume2
} from 'lucide-react';

export const TicketManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCrimeType, setFilterCrimeType] = useState("all");

  const tickets = [
    {
      id: "T-2024-001247",
      callerName: "Ramesh Kumar",
      phone: "+91 9876543210",
      datetime: "2024-01-15 14:30",
      crimeType: "Theft",
      subtype: "House Breaking",
      location: "MG Road, Visakhapatnam",
      audioFile: "call_001247.mp3",
      status: "Processing",
      priority: "Medium",
      assignedTo: "Station-VSP-01"
    },
    {
      id: "T-2024-001246",
      callerName: "Lakshmi Devi",
      phone: "+91 9876543211",
      datetime: "2024-01-15 14:25",
      crimeType: "Domestic Violence",
      subtype: "Physical Assault",
      location: "Gandhi Nagar, Vijayawada",
      audioFile: "call_001246.mp3",
      status: "Assigned",
      priority: "High",
      assignedTo: "Station-VJA-02"
    },
    {
      id: "T-2024-001245",
      callerName: "Suresh Babu",
      phone: "+91 9876543212",
      datetime: "2024-01-15 14:20",
      crimeType: "Traffic Violation",
      subtype: "Accident",
      location: "NH-16, Guntur",
      audioFile: "call_001245.mp3",
      status: "Resolved",
      priority: "Low",
      assignedTo: "Traffic-GNT-01"
    },
    {
      id: "T-2024-001244",
      callerName: "Priya Sharma", 
      phone: "+91 9876543213",
      datetime: "2024-01-15 14:15",
      crimeType: "Public Disturbance",
      subtype: "Noise Complaint",
      location: "Market Area, Tirupati",
      audioFile: "call_001244.mp3",
      status: "Investigating",
      priority: "Low",
      assignedTo: "Station-TPT-01"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'Investigating': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TicketDetailModal = ({ ticket }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Ticket Details - {ticket.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Caller Information
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{ticket.callerName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Phone className="h-3 w-3 mr-1" />
                {ticket.phone}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Incident Details
            </label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{ticket.crimeType}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.subtype}</p>
              <div className="flex space-x-2 mt-2">
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Location
          </label>
          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {ticket.location}
            </p>
            <div className="mt-3 h-32 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 to-blue-900 rounded flex items-center justify-center">
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Audio Recording
          </label>
          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{ticket.audioFile}</span>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Raw JSON Data
          </label>
          <div className="mt-1 p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-h-40 overflow-y-auto">
            <pre>{JSON.stringify({
              ticketId: ticket.id,
              caller: {
                name: ticket.callerName,
                phone: ticket.phone
              },
              incident: {
                type: ticket.crimeType,
                subtype: ticket.subtype,
                priority: ticket.priority,
                timestamp: ticket.datetime
              },
              location: {
                address: ticket.location,
                coordinates: { lat: 17.6868, lng: 83.2185 }
              },
              status: ticket.status,
              assignedTo: ticket.assignedTo
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ticket Management
        </h2>
        <Badge variant="outline">
          {tickets.length} Total Tickets
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by caller name, phone, or location..."
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
              </SelectContent>
            </Select>
            <Select value={filterCrimeType} onValueChange={setFilterCrimeType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Crime Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crime Types</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="assault">Assault</SelectItem>
                <SelectItem value="domestic-violence">Domestic Violence</SelectItem>
                <SelectItem value="traffic-violation">Traffic Violation</SelectItem>
                <SelectItem value="public-disturbance">Public Disturbance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Tickets</CardTitle>
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
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4 font-medium text-blue-600">
                      {ticket.id}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{ticket.callerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ticket.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {ticket.datetime}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{ticket.crimeType}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ticket.subtype}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {ticket.location}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
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
                          <TicketDetailModal ticket={ticket} />
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
        </CardContent>
      </Card>
    </div>
  );
};
