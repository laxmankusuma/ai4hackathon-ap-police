// src/services/incidentService.ts
import { ProcessedIncident } from '@/types/incident';

const API_BASE_URL = 'http://localhost:8000';

export const fetchIncidents = async (): Promise<ProcessedIncident[]> => {
  try {
    console.log('Fetching incidents from:', `${API_BASE_URL}/all_records`);

    const response = await fetch(`${API_BASE_URL}/all_records`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the raw response text first to debug
    const rawText = await response.text();
    console.log('Raw response:', rawText);

    // Parse the JSON
    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Parsed data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    // Handle different response structures
    let incidents;
    if (Array.isArray(data)) {
      // Direct array response
      incidents = data;
    } else if (data && Array.isArray(data.data)) {
      // Wrapped in data property
      incidents = data.data;
    } else if (data && Array.isArray(data.incidents)) {
      // Wrapped in incidents property
      incidents = data.incidents;
    } else if (data && Array.isArray(data.records)) {
      // Wrapped in records property
      incidents = data.records;
    } else {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response structure from server');
    }

    console.log('Processing incidents:', incidents.length, 'items');

    // Validate that we have an array
    if (!Array.isArray(incidents)) {
      throw new Error('Expected array of incidents but got: ' + typeof incidents);
    }

    // Process and validate each incident
    const processedIncidents = incidents.map((incident: any, index: number) => {
      console.log(`Processing incident ${index}:`, incident);

      // Validate required fields exist
      if (!incident || typeof incident !== 'object') {
        console.warn(`Invalid incident at index ${index}:`, incident);
        return null;
      }

      return {
        id: incident.id || incident.incident_id || Math.floor(Math.random() * 100000),
        lat: parseFloat(incident.lat || incident.latitude || '0') || 0,
        lng: parseFloat(incident.lng || incident.longitude || '0') || 0,
        type: incident.type || incident.crime_type || incident.incident_type || 'Unknown',
        severity: incident.severity || incident.priority || 'Medium',
        time: incident.time || incident.incident_date || incident.created_at || 'Unknown',
        district: incident.district || incident.area || incident.location || 'Unknown',
        description: incident.description || incident.details || '',
        ticketid: incident.ticketid || incident.ticket_id || incident.reference_number || '',
        caller_name: incident.caller_name || incident.reporter || incident.caller || 'Anonymous',
        address: incident.address || incident.location_address || incident.street_address || '',
        officer: incident.officer || incident.assigned_officer || incident.responding_officer || '',
        status: incident.status || incident.case_status || 'Pending'
      };
    }).filter(Boolean); // Remove any null entries

    console.log('Successfully processed incidents:', processedIncidents.length);
    return processedIncidents as ProcessedIncident[];

  } catch (error) {
    console.error('Error fetching incidents:', error);

    // More specific error handling
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    } else if (error instanceof SyntaxError) {
      throw new Error('Server returned invalid data format.');
    } else {
      throw error;
    }
  }
};

// Alternative fetch method if the main one fails
export const fetchIncidentsAlternative = async (): Promise<ProcessedIncident[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/all_records`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server did not return JSON data');
    }

    const data = await response.json();

    // Simple processing assuming direct array
    if (!Array.isArray(data)) {
      throw new Error('Expected array response');
    }

    return data.map((incident: any) => ({
      id: incident.id || Math.floor(Math.random() * 100000),
      lat: parseFloat(incident.lat) || 0,
      lng: parseFloat(incident.lng) || 0,
      type: incident.type || 'Unknown',
      severity: incident.severity || 'Medium',
      time: incident.time || 'Unknown',
      district: incident.district || 'Unknown',
      description: incident.description || '',
      ticketid: incident.ticketid || '',
      caller_name: incident.caller_name || 'Anonymous',
      address: incident.address || '',
      officer: incident.officer || '',
      status: incident.status || 'Pending'
    }));

  } catch (error) {
    console.error('Alternative fetch failed:', error);
    throw error;
  }
};

export const getDistrictStats = (incidents: ProcessedIncident[]) => {
  const districtMap = new Map<string, number>();

  incidents.forEach(incident => {
    const count = districtMap.get(incident.district) || 0;
    districtMap.set(incident.district, count + 1);
  });

  return Array.from(districtMap.entries())
    .map(([name, incidents]) => ({ name, incidents }))
    .sort((a, b) => b.incidents - a.incidents);
};

export const getCrimeTypeStats = (incidents: ProcessedIncident[]) => {
  const typeMap = new Map<string, number>();

  incidents.forEach(incident => {
    const count = typeMap.get(incident.type) || 0;
    typeMap.set(incident.type, count + 1);
  });

  const colors = {
    "Body Offence": "red",              // violent, high-alert
    "Robbery": "purple",                // stealthy, criminal
    "Offence Against Women": "blue",    // empathy, serious
    "Accident": "orange",               // caution
    "Disaster": "brown",                // earthy, severe
    "Missing": "maroon",                // emotional, alert
    "Offence Against Public": "yellow"  // general public caution
  };


  return Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      color: colors[type as keyof typeof colors] || "#6b7280"
    }))
    .sort((a, b) => b.count - a.count);
};