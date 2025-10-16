# 🗽 NYC Taxi Cleaning & Data Explorer
This is the link to the video walkthrough - https://www.loom.com/share/f9305644337041f3b6e1ad4c139f644c?sid=572eb1e8-db06-4361-9de8-8a82b4ddfb1e

This repository contains a complete project for **cleaning**, **analyzing**, and **visualizing** New York City Taxi trip data.

It includes:
- 🧠 **Backend API** built with Node.js and Express  
- 💻 **Frontend Dashboard** built with HTML, CSS, and JavaScript  
- 📊 **Custom algorithms** for sorting, anomaly detection, and filtering  
- 🌍 **Interactive visualization** of taxi trip patterns and statistics  

---

## 📁 Project Structure

nyc_taxi_cleaning/
├── backend/ # Node.js API for data processing
├── frontend/ # Interactive web dashboard
├── data/ # Raw and cleaned datasets
├── logs/ # Anomaly and invalid record logs
└── README.md # Main documentation (this file)



## ⚙️ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Ladecodes1/nyc_taxi_cleaning.git
cd nyc_taxi_cleaning

### 2. Run the Backend
Navigate to the backend folder and start the server:

bash

cd backend
npm install
npm start
By default, the API will start at:

arduino

http://localhost:3000
Available Endpoints:

Endpoint	Description
/trips	Returns cleaned taxi trip data
/insights	Returns statistical summaries
/locations	Pickup and dropoff analysis
/anomalies	Anomaly detection results
/health	Server health check

### 3. Run the Frontend
Open the frontend folder:

bash

cd ../frontend
Then:

Open index.html in your browser, or

Run it in VS Code using Live Server.

To connect to your local backend, edit app.js:

js

const API_BASE_URL = 'http://localhost:3000';
let USE_MOCK_DATA = false;
Save and refresh — your dashboard will now display live backend data.

## 🧹 Data Cleaning Logic
The backend processes and cleans taxi data to ensure only realistic trips are kept.

Steps:

Removes invalid coordinates (outside NYC)

Detects anomalies in speed, fare, and trip duration

Filters duplicate or corrupted records

Logs invalid data into logs/removed_records.csv

## 🔍 Algorithms Implemented
Algorithm	Purpose
Quick Sort	Default sorting (O(n log n))
Merge Sort	Stable sorting for datasets
Bubble Sort	Simple iterative sorting
Anomaly Detection	Identifies outliers (speed, distance, fare)
Haversine Formula	Calculates trip distance between GPS coordinates

## 🌍 Visualization Dashboard (Frontend)
The web dashboard presents the cleaned data using:

Interactive pickup heatmaps

Charts showing trip durations, fares, and distances

Summary cards for total trips and averages

A sidebar filter to adjust date, fare, and distance ranges

CSV export option for filtered data

Built with:

Leaflet.js → Maps and location plotting

Chart.js → Data visualization

Custom JS → Filters, interactions, and animations

## 🧩 How Everything Fits Together
Data is loaded and cleaned by the backend.

API exposes the cleaned dataset via /trips and related endpoints.

Frontend fetches and visualizes the data in charts and maps.

Users can interact with filters to explore patterns in real time.

## 👥 Contributors
NAME - Oladimeji Ayanleke	ROLE - Frontend Developer	 DESCRIPTION - Built the dashboard UI and visual components
NAME - Sandrine	ROLE - Backend Engineer	DESCRIPTION - Developed the API and data-cleaning algorithms
