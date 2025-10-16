// app.js — frontend for the dashboard
// set USE_MOCK_DATA to false and update API_BASE_URL when backend is ready

const API_BASE_URL = 'http://localhost:5000/api';
const USE_MOCK_DATA = true;
const MOCK_SIZE = 800;

let map, heatLayer;
let durationChart, fareChart, timeSeriesChart;
let tripsData = [];
let isSidebarOpen = true;

// start
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initCharts();
  initUI();
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
  window.lastRendered = data;
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

// Layout + actions
function initUI() {
  // populate preset dropdown from localStorage
  refreshPresetOptions();
  // apply persisted theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') document.body.classList.add('theme-dark');
}

function toggleSidebar() {
  isSidebarOpen = !isSidebarOpen;
  const el = document.getElementById('sidebar');
  if (!el) return;
  el.classList.toggle('hidden', !isSidebarOpen);
  // give layout time to settle before recalculating map size
  setTimeout(() => { if (map) map.invalidateSize(false); }, 250);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleTheme() {
  document.body.classList.toggle('theme-dark');
  const isDark = document.body.classList.contains('theme-dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Quick zooms
const QUICK_ZOOMS = {
  manhattan: { center: [40.7831, -73.9712], zoom: 12 },
  brooklyn: { center: [40.6782, -73.9442], zoom: 12 },
  queens: { center: [40.7282, -73.7949], zoom: 11 }
};
function quickZoom(area) {
  const cfg = QUICK_ZOOMS[area];
  if (!cfg || !map) return;
  map.setView(cfg.center, cfg.zoom);
}

// Resize handling to keep map/charts fitting the screen
window.addEventListener('resize', () => {
  if (map) map.invalidateSize(false);
});

// Presets
function currentFilterValues() {
  return {
    dateFrom: document.getElementById('dateFrom').value,
    dateTo: document.getElementById('dateTo').value,
    minDistance: document.getElementById('minDistance').value,
    maxDistance: document.getElementById('maxDistance').value,
    minFare: document.getElementById('minFare').value,
    maxFare: document.getElementById('maxFare').value
  };
}

function setFilterValues(v) {
  document.getElementById('dateFrom').value = v.dateFrom || '';
  document.getElementById('dateTo').value = v.dateTo || '';
  document.getElementById('minDistance').value = v.minDistance || '';
  document.getElementById('maxDistance').value = v.maxDistance || '';
  document.getElementById('minFare').value = v.minFare || '';
  document.getElementById('maxFare').value = v.maxFare || '';
}

function savePreset() {
  const name = (document.getElementById('presetName').value || '').trim();
  if (!name) { showError('Enter a preset name.'); return; }
  const presets = JSON.parse(localStorage.getItem('presets') || '{}');
  presets[name] = currentFilterValues();
  localStorage.setItem('presets', JSON.stringify(presets));
  refreshPresetOptions(name);
}

function loadPreset() {
  const select = document.getElementById('presetSelect');
  const key = select && select.value;
  const presets = JSON.parse(localStorage.getItem('presets') || '{}');
  const val = presets[key];
  if (!val) { showError('No preset selected.'); return; }
  setFilterValues(val);
  applyFilters();
}

function refreshPresetOptions(selectName) {
  const select = document.getElementById('presetSelect');
  if (!select) return;
  const presets = JSON.parse(localStorage.getItem('presets') || '{}');
  select.innerHTML = '';
  Object.keys(presets).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    if (selectName && selectName === name) opt.selected = true;
    select.appendChild(opt);
  });
}

// Export CSV
function exportCSV() {
  const rows = [
    ['id','pickup_datetime','pickup_lat','pickup_lon','distance','fare','duration']
  ];
  for (const t of (window.lastRendered || tripsData)) {
    rows.push([
      t.id,
      t.pickup_datetime || t.timestamp || t.date || '',
      t.pickup_lat || t.lat || t.latitude || '',
      t.pickup_lon || t.lon || t.longitude || '',
      t.distance || t.trip_distance || '',
      t.fare || t.fare_amount || '',
      t.duration || t.trip_duration || ''
    ]);
  }
  const csv = rows.map(r => r.map(x => (x===undefined||x===null)?'':String(x).replaceAll('"','""')).map(x=>`"${x}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'nyc_taxi_export.csv'; document.body.appendChild(a); a.click();
  setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}
