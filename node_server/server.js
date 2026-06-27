// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/precipitation', async (req, res) => {
  const { start, end, lat, lon } = req.query;
  try {
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?start=${start}&end=${end}&latitude=${lat}&longitude=${lon}&community=RE&parameters=PRECTOTCORR&format=JSON`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
