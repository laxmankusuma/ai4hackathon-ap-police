import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Map, 
  Mic, 
  Users,
  Save,
  Plus,
  Edit,
  Trash2,
  Key
} from 'lucide-react';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [autoAssign, setAutoAssign] = useState(true);
  const [realTimeNotifications, setRealTimeNotifications] = useState(true);

  const crimeTypesData = [
    { id: 1, type: "Theft", subtypes: ["House Breaking", "Vehicle Theft", "Pickpocket"], severity: "Medium" },
    { id: 2, type: "Assault", subtypes: ["Physical Attack", "Verbal Assault", "Armed Assault"], severity: "High" },
    { id: 3, type: "Domestic Violence", subtypes: ["Physical Abuse", "Emotional Abuse", "Harassment"], severity: "High" },
    { id: 4, type: "Traffic Violation", subtypes: ["Speeding", "Accident", "DUI", "Parking"], severity: "Low" },
    { id: 5, type: "Public Disturbance", subtypes: ["Noise Complaint", "Fighting", "Vandalism"], severity: "Medium" }
  ];

  const users = [
    { id: 1, name: "Inspector Ravi Kumar", role: "Station Head", station: "VSP-01", status: "Active" },
    { id: 2, name: "Constable Priya Sharma", role: "Operator", station: "VJA-02", status: "Active" },
    { id: 3, name: "SI Ramesh Babu", role: "Supervisor", station: "TPT-01", status: "Inactive" },
    { id: 4, name: "Head Constable Lakshmi", role: "Operator", station: "GNT-01", status: "Active" }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Station Head': return 'bg-purple-100 text-purple-800';
      case 'Supervisor': return 'bg-blue-100 text-blue-800';
      case 'Operator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings & Administration
        </h2>
      </div>

      <Tabs defaultValue="master-data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="master-data">Master Data</TabsTrigger>
          <TabsTrigger value="api-config">API Config</TabsTrigger>
          <TabsTrigger value="voice-bot">Voice Bot</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="master-data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Crime Types & Classifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Crime Type Management</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Crime Type
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {crimeTypesData.map((crime) => (
                    <div key={crime.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{crime.type}</h4>
                          <Badge className={getSeverityColor(crime.severity)}>
                            {crime.severity} Priority
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {crime.subtypes.map((subtype, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subtype}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Google Maps API Key
                </label>
                <div className="flex space-x-2">
                  <Input 
                    type="password" 
                    placeholder="Enter your Google Maps API key"
                    className="flex-1"
                  />
                  <Button variant="outline">
                    Test Connection
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for location resolution and mapping features
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Places API Configuration
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Search Radius (km)</label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max Results</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Speech-to-Text API
                </label>
                <Select defaultValue="google">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Speech-to-Text</SelectItem>
                    <SelectItem value="azure">Azure Cognitive Services</SelectItem>
                    <SelectItem value="aws">Amazon Transcribe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-bot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5" />
                <span>Voice Bot Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Default Language
                </label>
                <Select defaultValue="mixed">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telugu">Telugu</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="mixed">Mixed (Telugu/English)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Voice Recognition Timeout (seconds)
                </label>
                <Input type="number" defaultValue="30" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Retry Logic
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-retry failed geocoding</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fallback to manual location entry</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Request caller to repeat unclear responses</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Voice Quality Settings
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Sample Rate (Hz)</label>
                    <Select defaultValue="16000">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8000">8000</SelectItem>
                        <SelectItem value="16000">16000</SelectItem>
                        <SelectItem value="44100">44100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Audio Format</label>
                    <Select defaultValue="wav">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wav">WAV</SelectItem>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="flac">FLAC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">System Users</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">
                          Name
                        </th>
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">
                          Role
                        </th>
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">
                          Station
                        </th>
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">
                          Status
                        </th>
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-4 font-medium">{user.name}</td>
                          <td className="py-4">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-4">{user.station}</td>
                          <td className="py-4">
                            <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>System Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable dark theme for the dashboard
                    </p>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-assign Tickets</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically assign tickets to nearest stations
                    </p>
                  </div>
                  <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Real-time Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show live notifications for new incidents
                    </p>
                  </div>
                  <Switch checked={realTimeNotifications} onCheckedChange={setRealTimeNotifications} />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium mb-4">Privacy & Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Log all voice calls</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable audit trail</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-delete old recordings (90 days)</span>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
