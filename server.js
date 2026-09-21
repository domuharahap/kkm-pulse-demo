const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

function sparkline(base, variance, len = 30) {
    const pts = [];
    let v = base;
    for (let i = 0; i < len; i++) {
        v = Math.max(0, v + (Math.random() - 0.48) * variance);
        pts.push(Math.round(v));
    }
    return pts;
}

const HOSPITALS = [
    { name: 'Hospital Kuala Lumpur', short: 'HKL', region: 'Kuala Lumpur', dept: 'Emergency', baseOcc: 87, baseWait: 24, status: 'busy' },
    { name: 'Hospital Putrajaya', short: 'HPJ', region: 'Putrajaya', dept: 'Outpatient', baseOcc: 65, baseWait: 15, status: 'normal' },
    { name: 'Hospital Selayang', short: 'HSY', region: 'Selangor', dept: 'Surgery', baseOcc: 72, baseWait: 18, status: 'normal' },
    { name: 'Hospital Ampang', short: 'HAM', region: 'Selangor', dept: 'Paediatrics', baseOcc: 58, baseWait: 12, status: 'normal' },
    { name: 'Hospital Serdang', short: 'HSD', region: 'Selangor', dept: 'ICU', baseOcc: 94, baseWait: 42, status: 'critical' },
    { name: 'Hospital Kajang', short: 'HKJ', region: 'Selangor', dept: 'Outpatient', baseOcc: 81, baseWait: 30, status: 'busy' },
    { name: 'Hospital Tengku Ampuan Rahimah', short: 'HTAR', region: 'Selangor', dept: 'Emergency', baseOcc: 61, baseWait: 14, status: 'normal' },
];

app.get('/api/status', (req, res) => {
    const activePatients = Math.floor(Math.random() * 80) + 1560;
    const totalVisits = Math.floor(Math.random() * 100) + 2950;
    const bedOccupancy = (74 + Math.random() * 8).toFixed(1);
    const activeWards = Math.floor(Math.random() * 3) + 50;

    const prevPatients = Math.floor(activePatients * 0.85);
    const prevVisits = Math.floor(totalVisits * 0.93);
    const targetOcc = 80;
    const prevWards = activeWards - Math.floor(Math.random() * 4 + 1);

    const hospitals = HOSPITALS.map(h => ({
        name: h.name,
        short: h.short,
        region: h.region,
        dept: h.dept,
        activePatients: Math.floor(Math.random() * 60) + (h.baseOcc * 2),
        occupancy: Math.min(99, Math.max(50, h.baseOcc + Math.floor((Math.random() - 0.5) * 8))),
        avgWait: Math.max(5, h.baseWait + Math.floor((Math.random() - 0.5) * 6)),
        status: h.status,
    }));

    res.json({
        activePatients,
        prevPatients,
        totalVisits,
        prevVisits,
        bedOccupancy: parseFloat(bedOccupancy),
        targetOcc,
        activeWards,
        prevWards,
        history: {
            patients: sparkline(activePatients, 40),
            visits: sparkline(totalVisits, 120),
            beds: sparkline(parseFloat(bedOccupancy), 3),
            wards: sparkline(activeWards, 2),
        },
        hospitals,
        timestamp: new Date().toISOString(),
    });
});

// Chaos endpoint: CPU spike for Davis AI demo
app.get('/api/trigger-anomaly', (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 3000) {
        Math.random() * Math.random();
    }
    res.json({ message: 'Anomaly injected! Check your Dynatrace Davis AI dashboard for the CPU spike alert.' });
});

// Only listen if run directly (prevents port-in-use errors during testing)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`KKM Pulse App running hot on port ${PORT} 🚀`);
    });
}

// Export app for Jest tests
module.exports = app;
