# NYC Taxi Mobility Explorer — Frontend

Simple frontend for the NYC Taxi Mobility Explorer project.  
Built with **HTML, CSS, and JavaScript**, using **Leaflet** for maps and **Chart.js** for charts.

This frontend works in two modes:
- **Mock mode** (for local testing)
- **Live mode** (connected to the backend API)

---

## Features

- Interactive pickup-location **heatmap**
- **Trip duration** and **fare** distribution charts
- **Trips-per-hour** time series chart
- **Summary cards** (total trips, avg. distance, fare, duration)
- **Sidebar filters** (date, distance, fare range)
- **CSV export**
- Responsive dashboard layout

---

##  Prerequisites

- A browser (Chrome, Edge, Firefox)
- (Optional) VS Code + **Live Server** extension
- (Optional) A running backend API

---

##  Quick Start (Mock Data Mode)

1. Go to your frontend folder:
   ```bash
   cd nyc_taxi_cleaning/frontend
Open index.html in your browser,
or use VS Code → Open with Live Server.

The dashboard loads automatically with mock data — all charts and maps will work offline.

Connect to the Backend (Live Data Mode)
Make sure your backend server is running on http://localhost:3000

Open app.js and edit the top lines:

const API_BASE_URL = 'http://localhost:3000';
let USE_MOCK_DATA = false;
Save and refresh the page — now you’ll see real data from the backend API.

Expected Data Format
The backend should return data like:

[
  {
    "pickup_datetime": "2023-01-01T08:30:00Z",
    "pickup_lat": 40.7128,
    "pickup_lon": -74.006,
    "distance": 4.5,
    "fare": 12.25,
    "duration": 15
  }
]

Sidebar Filters
Use the sidebar to:

Filter trips by date range

Filter by distance (km) or fare (USD)

Reset filters or export visible data as .csv

Project Files
File	Description
index.html	Main page layout
styles.css	Dashboard and sidebar styling
app.js	Map, chart, and filter logic

Author
Oladimeji Ayanleke
Frontend Developer — African Leadership University



