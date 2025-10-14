// app.js — frontend for the dashboard
// set USE_MOCK_DATA to false and update API_BASE_URL when backend is ready

const API_BASE_URL = 'http://localhost:5000/api';
const USE_MOCK_DATA = true;
const MOCK_SIZE = 800;

let map, heatLayer;
let durationChart, fareChart, timeSeriesChart;
let tripsData = [];

// start
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initCharts();
  if (USE_MOCK_DATA) {
    generateMock().then(d => {
      tripsData = d;
      renderAll(tripsData);
    }).catch(err => {
      console.error(err);
      showError('Could not make mock data.');
    });
  } else {
    fetchFromServer();
  }
});

// map
function initMap() {
  map = L.map('map').setView([40.7589, -73.9851], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  heatLayer = L.heatLayer([], { radius: 15, blur: 20, maxZoom: 13 }).addTo(map);
}

// charts
function initCharts() {
  const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } };

  durationChart = new Chart(document.getElementById('durationChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Trips', data: [], backgroundColor: 'rgba(102,126,234,0.6)' }] },
    options: opts
  });

  fareChart = new Chart(document.getElementById('fareChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Trips', data: [], backgroundColor: 'rgba(118,75,162,0.6)' }] },
    options: opts
  });

  timeSeriesChart = new Chart(document.getElementById('timeSeriesChart'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Trips per Hour', data: [], backgroundColor: 'rgba(102,126,234,0.2)', borderColor: 'rgba(102,126,234,1)', tension: 0.35 }] },
    options: opts
  });
}

// server
async function fetchFromServer() {
  try {
    showLoading();
    const res = await fetch(`${API_BASE_URL}/trips`);
    if (!res.ok) throw new Error('Server error ' + res.status);
    const json = await res.json();
    tripsData = Array.isArray(json) ? json : (json.trips || []);
    renderAll(tripsData);
  } catch (e) {
    console.error(e);
    showError('Could not load data from server.');
  } finally {
    hideLoading();
  }
}

// mock generator
function generateMock() {
  return new Promise(resolve => {
    const arr = [];
    const base = new Date('2023-01-01T06:00:00');
    for (let i=0;i<MOCK_SIZE;i++){
      const t0 = new Date(base.getTime() + Math.floor(Math.random()*20*3600*1000));
      const duration = Math.floor(Math.random()*80) + 1;
      const distance = parseFloat((Math.max(0.2, (duration/4) * (Math.random()*0.9 + 0.2))).toFixed(2));
      const fare = parseFloat((Math.max(2.5, 1.5*distance + Math.random()*12)).toFixed(2));
      const lat = 40.58 + Math.random()*0.5;
      const lon = -74.15 + Math.random()*0.4;
      arr.push({ id: i+1, pickup_datetime: t0.toISOString(), pickup_lat: lat, pickup_lon: lon, distance, fare, duration });
    }
    setTimeout(()=>resolve(arr), 80);
  });
}

// filters (called by buttons)
function applyFilters() {
  const f = {
    from: document.getElementById('dateFrom').value,
    to: document.getElementById('dateTo').value,
    minD: parseFloat(document.getElementById('minDistance').value) || 0,
    maxD: parseFloat(document.getElementById('maxDistance').value) || Infinity,
    minF: parseFloat(document.getElementById('minFare').value) || 0,
    maxF: parseFloat(document.getElementById('maxFare').value) || Infinity
  };

  const filtered = tripsData.filter(t => {
    const dt = new Date(t.pickup_datetime || t.timestamp || t.date);
    if (f.from && dt < new Date(f.from)) return false;
    if (f.to && dt > new Date(f.to)) return false;
    const d = t.distance || t.trip_distance || 0;
    if (d < f.minD || d > f.maxD) return false;
    const fare = t.fare || t.fare_amount || 0;
    if (fare < f.minF || fare > f.maxF) return false;
    return true;
  });

  renderAll(filtered);
}

function resetFilters() {
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';
  document.getElementById('minDistance').value = '';
  document.getElementById('maxDistance').value = '';
  document.getElementById('minFare').value = '';
  document.getElementById('maxFare').value = '';
  renderAll(tripsData);
}

// render everything
function renderAll(data) {
  renderStats(data);
  renderHeatmap(data);
  renderDuration(data);
  renderFare(data);
  renderTimes(data);
}

function renderStats(data) {
  const n = data.length;
  const sumD = data.reduce((s,t)=>s + (t.distance || t.trip_distance || 0), 0);
  const sumF = data.reduce((s,t)=>s + (t.fare || t.fare_amount || 0), 0);
  const sumT = data.reduce((s,t)=>s + (t.duration || t.trip_duration || 0), 0);

  document.getElementById('totalTrips').textContent = n.toLocaleString();
  document.getElementById('avgDistance').textContent = (n ? (sumD / n).toFixed(2) : '0') + ' km';
  document.getElementById('avgFare').textContent = '$' + (n ? (sumF / n).toFixed(2) : '0');
  document.getElementById('avgDuration').textContent = (n ? Math.round(sumT / n) : 0) + ' min';
}

function renderHeatmap(data) {
  const pts = [];
  const limit = 3000;
  for (let i=0,c=0;i<data.length && c<limit;i++){
    const t = data[i];
    const lat = t.pickup_lat || t.lat || t.latitude;
    const lon = t.pickup_lon || t.lon || t.longitude;
    if (lat && lon) { pts.push([lat, lon, 0.6]); c++; }
  }
  heatLayer.setLatLngs(pts);
  if (pts.length) {
    const lats = pts.map(p=>p[0]), lons = pts.map(p=>p[1]);
    const bounds = L.latLngBounds([Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]);
    map.fitBounds(bounds.pad(0.2), { maxZoom: 13 });
  }
}

function renderDuration(data) {
  const bins = [0,5,10,15,20,30,45,60,90,120];
  const counts = bins.map(()=>0);
  for (const t of data) {
    const d = t.duration || t.trip_duration || 0;
    for (let i=0;i<bins.length;i++){
      if (i === bins.length-1 || d < bins[i+1]) { counts[i]++; break; }
    }
  }
  const labels = bins.map((b,i)=> i < bins.length-1 ? `${b}-${bins[i+1]}m` : `${b}+m`);
  durationChart.data.labels = labels;
  durationChart.data.datasets[0].data = counts;
  durationChart.update();
}

function renderFare(data) {
  const bins = [0,5,10,15,20,30,50,75,100];
  const counts = bins.map(()=>0);
  for (const t of data) {
    const f = t.fare || t.fare_amount || 0;
    for (let i=0;i<bins.length;i++){
      if (i === bins.length-1 || f < bins[i+1]) { counts[i]++; break; }
    }
  }
  const labels = bins.map((b,i)=> i < bins.length-1 ? `$${b}-$${bins[i+1]}` : `$${b}+`);
  fareChart.data.labels = labels;
  fareChart.data.datasets[0].data = counts;
  fareChart.update();
}

function renderTimes(data) {
  const counts = new Array(24).fill(0);
  for (const t of data) {
    const dt = new Date(t.pickup_datetime || t.timestamp || t.date);
    const h = isNaN(dt.getHours()) ? 0 : dt.getHours();
    counts[h]++;
  }
  const labels = Array.from({length:24}, (_,i)=> i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i-12} PM`);
  timeSeriesChart.data.labels = labels;
  timeSeriesChart.data.datasets[0].data = counts;
  timeSeriesChart.update();
}

// UI helpers
function showLoading() {
  document.querySelectorAll('.chart-container').forEach(c => c.innerHTML = '<div class="loading">Loading...</div>');
}
function hideLoading() { /* charts will show themselves */ }
function showError(msg) {
  document.getElementById('error-message').innerHTML = `<div class="error">${msg}</div>`;
}
