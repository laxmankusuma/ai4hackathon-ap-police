import streamlit as st
import pandas as pd
import mysql.connector
import folium
from folium.plugins import HeatMap, MarkerCluster
from streamlit_folium import st_folium
from datetime import datetime

# Initialize Google Maps client (keeping it for verified_address formatting)
API_KEY = 'AIzaSyDWT0N7pHNSf-SQ5ueYHwrWWuA3_aec580'  # Replace with your actual API key

# Color palette for crime types

CRIME_COLORS = {
    'Body Offence': 'red',           # High severity (Murder, Kidnapping, etc.)
    'Robbery': 'purple',             # Medium-high severity
    'Offence Against Women': 'blue', # Medium-high severity
    'Accident': 'green',             # Medium severity
    'Disaster': 'orange',            # Medium-high severity (context-dependent)
    'Missing': 'gray',               # Lower severity
    'Offence Against Public': 'yellow'# Lowest severity
}

# Andhra Pradesh boundaries
AP_CENTER = [15.9129, 79.7400]
AP_BOUNDS = {
    'north': 19.5,
    'south': 12.5,
    'west': 76.5,
    'east': 84.5
}

def get_db_connection():
    """Establish MySQL connection"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='aihackathon',  # Replace with your database name
            user='aiuser',  # Replace with your MySQL username
            password='Ptpl!234'  # Replace with your MySQL password
        )
        return connection
    except Exception as e:
        st.error(f"Database connection error: {str(e)}")
        return None

def fetch_incident_data():
    """Fetch incident data from MySQL table"""
    try:
        connection = get_db_connection()
        if connection:
            query = """
            SELECT ticketid, caller_name, caller_gender, crime_type, crime_subtype, 
                   severity, incident_date, incident_time, address_text, 
                   verified_address, district, latitude, longitude, 
                   officer_assigned, review_status
            FROM incident_reports
            """
            df = pd.read_sql(query, connection)
            connection.close()
            return df
        return pd.DataFrame()
    except Exception as e:
        st.error(f"Error fetching data: {str(e)}")
        return pd.DataFrame()

def create_ap_map(data, use_heatmap=True, filters=None):
    """Create a folium map focused on Andhra Pradesh"""
    if data.empty:
        m = folium.Map(
            location=AP_CENTER, 
            zoom_start=7,
            max_bounds=True,
            min_lat=AP_BOUNDS['south'],
            max_lat=AP_BOUNDS['north'],
            min_lon=AP_BOUNDS['west'],
            max_lon=AP_BOUNDS['east']
        )
        return m
    
    # Create base map centered on AP with bounds
    m = folium.Map(
        location=AP_CENTER, 
        zoom_start=7,
        max_bounds=True,
        min_lat=AP_BOUNDS['south'],
        max_lat=AP_BOUNDS['north'],
        min_lon=AP_BOUNDS['west'],
        max_lon=AP_BOUNDS['east']
    )
    
    if use_heatmap:
        # Create separate heatmaps for each crime type
        for crime_type, color in CRIME_COLORS.items():
            cat_data = data[data['crime_type'] == crime_type]
            if not cat_data.empty:
                heat_data = [[row['latitude'], row['longitude']] for _, row in cat_data.iterrows()]
                HeatMap(heat_data, name=crime_type, gradient={0.4: color}).add_to(m)
    else:
        # Use marker clusters with crime type colors
        marker_cluster = MarkerCluster().add_to(m)
        for _, row in data.iterrows():
            popup_text = f"""
            <b>Ticket ID:</b> {row['ticketid']}<br>
            <b>Crime:</b> {row['crime_type']} - {row['crime_subtype']}<br>
            <b>Severity:</b> {row['severity']}<br>
            <b>Date:</b> {row['incident_date']}<br>
            <b>Address:</b> {row['verified_address']}<br>
            <b>Officer:</b> {row['officer_assigned']}<br>
            <b>Status:</b> {row['review_status']}
            """
            folium.Marker(
                location=[row['latitude'], row['longitude']],
                popup=popup_text,
                icon=folium.Icon(color=CRIME_COLORS.get(row['crime_type'], 'gray'))
            ).add_to(marker_cluster)
    
    folium.LayerControl().add_to(m)
    return m

def main():
    st.set_page_config(page_title="AI for AP Police", layout="wide")
    st.title("AI for Andhra Pradesh Police - Incident Visualization")
    
    # Initialize session state
    if 'incident_data' not in st.session_state:
        st.session_state.incident_data = fetch_incident_data()
    
    # Sidebar for filters
    with st.sidebar:
        st.header("Incident Filters")
        
        # Crime Type Filter
        crime_types = ['All'] + sorted(st.session_state.incident_data['crime_type'].unique().tolist())
        selected_crime_type = st.selectbox("Crime Type", crime_types)
        
        # Severity Filter
        severities = ['All'] + sorted(st.session_state.incident_data['severity'].astype(str).unique().tolist())
        selected_severity = st.selectbox("Severity", severities)
        
        # # District Filter
        # districts = ['All'] + sorted(st.session_state.incident_data['district'].unique().tolist())
        # selected_district = st.selectbox("District", districts)
        
        # Review Status Filter
        statuses = ['All'] + sorted(st.session_state.incident_data['review_status'].unique().tolist())
        selected_status = st.selectbox("Review Status", statuses)
        
        # Date Range Filter
        st.subheader("Date Range")
        data = st.session_state.incident_data
        if not data.empty:
            data['datetime'] = pd.to_datetime(data['incident_date'])
            min_date = data['datetime'].min().to_pydatetime()
            max_date = data['datetime'].max().to_pydatetime()
            
            date_range = st.slider(
                "Select date range",
                min_value=min_date,
                max_value=max_date,
                value=(min_date, max_date),
                format="YYYY-MM-DD"
            )
        else:
            date_range = None
    
    # Main display
    if not st.session_state.incident_data.empty:
        data = st.session_state.incident_data.copy()
        
        # Apply filters
        filtered_data = data.copy()
        if selected_crime_type != 'All':
            filtered_data = filtered_data[filtered_data['crime_type'] == selected_crime_type]
        if selected_severity != 'All':
            filtered_data = filtered_data[filtered_data['severity'].astype(str) == selected_severity]
        if selected_status != 'All':
            filtered_data = filtered_data[filtered_data['review_status'] == selected_status]
        if date_range:
            filtered_data['datetime'] = pd.to_datetime(filtered_data['incident_date'])
            filtered_data = filtered_data[
                (filtered_data['datetime'] >= date_range[0]) & 
                (filtered_data['datetime'] <= date_range[1])
            ]
        
        # Display filtered data
        st.header("Incident Records")
        st.dataframe(filtered_data[[
            'ticketid', 'caller_name', 'crime_type', 'crime_subtype', 
            'severity', 'incident_date', 'verified_address', 'district',
            'officer_assigned', 'review_status'
        ]], use_container_width=True)
        
        # Visualization type selector
        st.subheader("Map Visualization")
        viz_type = st.radio(
            "Visualization Type",
            ['Heatmap', 'Marker Cluster'],
            horizontal=True
        )
        
        # Generate and display map
        m = create_ap_map(filtered_data, use_heatmap=(viz_type == 'Heatmap'))
        st_folium(m, width=1200, height=600, key="map")
        
        # Show stats
        st.info(f"Showing {len(filtered_data)} of {len(data)} incidents")
        
        # Add refresh button
        if st.button("Refresh Data"):
            st.session_state.incident_data = fetch_incident_data()
            st.rerun()
    else:
        st.info("No incident data available. Please check database connection.")

if __name__ == "__main__":
    main()