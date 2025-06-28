
export interface Incident {
  sno: number;
  ticketid: string;
  caller_name: string;
  caller_phone: string | null;
  caller_gender: string;
  crime_type: string;
  crime_subtype: string;
  severity: number;
  incident_date: string;
  incident_time: string;
  transcribe_text: string;
  description: string;
  address_text: string;
  verified_address: string;
  district: string;
  latitude: number;
  longitude: number;
  evidence_type: string;
  officer_assigned: string;
  audio_file: string;
  review_status: string;
}

export interface ProcessedIncident {
  id: number;
  lat: number;
  lng: number;
  type: string;
  severity: string;
  time: string;
  district: string;
  description: string;
  ticketid: string;
  caller_name: string;
  address: string;
  officer: string;
  status: string;
}
