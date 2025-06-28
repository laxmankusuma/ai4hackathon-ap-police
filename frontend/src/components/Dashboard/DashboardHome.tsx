
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Ticket, 
  AlertTriangle, 
  MapPin,
  Upload,
  Play,
  TrendingUp
} from 'lucide-react';

export const DashboardHome = () => {
  const stats = [
    {
      title: "Total Tickets Today",
      value: "247",
      change: "+12%",
      icon: Ticket,
      color: "text-blue-600"
    },
    {
      title: "Live Calls Ongoing",
      value: "8",
      change: "Active",
      icon: Phone,
      color: "text-green-600"
    },
    {
      title: "Most Common Crime",
      value: "Theft",
      change: "32% of calls",
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      title: "Response Time Avg",
      value: "2.3 min",
      change: "-5% today",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Upload Audio",
      description: "Process new 112 call recordings",
      icon: Upload,
      action: "upload"
    },
    {
      title: "View Heatmap",
      description: "Live crime incident mapping",
      icon: MapPin,
      action: "heatmap"
    },
    {
      title: "Start Test Call",
      description: "Test voice agent functionality",
      icon: Play,
      action: "voice-agent"
    }
  ];

  const recentTickets = [
    {
      id: "T-2024-001247",
      caller: "Ramesh Kumar",
      location: "Visakhapatnam",
      crimeType: "Theft",
      time: "2 mins ago",
      status: "Processing"
    },
    {
      id: "T-2024-001246",
      caller: "Lakshmi Devi",
      location: "Vijayawada",
      crimeType: "Domestic Violence",
      time: "5 mins ago",
      status: "Assigned"
    },
    {
      id: "T-2024-001245",
      caller: "Suresh Babu",
      location: "Tirupati",
      crimeType: "Road Accident",
      time: "8 mins ago",
      status: "Resolved"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.color}`}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    {action.description}
                  </p>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Emergency Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ticket.id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ticket.caller} • {ticket.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{ticket.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Crime Heatmap Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Interactive heatmap preview - Click "View Heatmap" to explore
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
