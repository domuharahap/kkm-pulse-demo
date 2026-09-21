const request = require('supertest');
const app = require('./server');

describe('GET /', () => {
    it('serves the index page', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
    });
});

describe('GET /api/status', () => {
    let body;

    beforeAll(async () => {
        const res = await request(app).get('/api/status');
        expect(res.status).toBe(200);
        body = res.body;
    });

    it('returns expected top-level numeric fields', () => {
        expect(typeof body.activePatients).toBe('number');
        expect(typeof body.prevPatients).toBe('number');
        expect(typeof body.totalVisits).toBe('number');
        expect(typeof body.prevVisits).toBe('number');
        expect(typeof body.bedOccupancy).toBe('number');
        expect(typeof body.targetOcc).toBe('number');
        expect(typeof body.activeWards).toBe('number');
        expect(typeof body.prevWards).toBe('number');
    });

    it('returns a valid ISO timestamp', () => {
        expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    it('returns history arrays of length 30', () => {
        const { patients, visits, beds, wards } = body.history;
        for (const arr of [patients, visits, beds, wards]) {
            expect(Array.isArray(arr)).toBe(true);
            expect(arr).toHaveLength(30);
        }
    });

    it('returns 7 hospitals with required fields', () => {
        expect(Array.isArray(body.hospitals)).toBe(true);
        expect(body.hospitals).toHaveLength(7);
        for (const h of body.hospitals) {
            expect(h).toHaveProperty('name');
            expect(h).toHaveProperty('short');
            expect(h).toHaveProperty('region');
            expect(h).toHaveProperty('dept');
            expect(typeof h.activePatients).toBe('number');
            expect(h.occupancy).toBeGreaterThanOrEqual(50);
            expect(h.occupancy).toBeLessThanOrEqual(99);
            expect(h.avgWait).toBeGreaterThanOrEqual(5);
            expect(['normal', 'busy', 'critical']).toContain(h.status);
        }
    });

    it('activePatients is in expected range', () => {
        expect(body.activePatients).toBeGreaterThanOrEqual(1560);
        expect(body.activePatients).toBeLessThan(1640);
    });
});

describe('GET /api/trigger-anomaly', () => {
    it('returns anomaly confirmation message', async () => {
        const res = await request(app).get('/api/trigger-anomaly');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(typeof res.body.message).toBe('string');
        expect(res.body.message.length).toBeGreaterThan(0);
    });
}, 10000);
