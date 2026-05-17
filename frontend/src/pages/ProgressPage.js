import React, { useState, useEffect } from 'react';
import { sessionsAPI } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const TOOLTIP = {
  backgroundColor: '#1c2230',
  titleColor: '#f0f2f8',
  bodyColor: '#8892a4',
  borderColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1,
};

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: TOOLTIP },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#525d6e', font: { family: 'Barlow', size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#525d6e', font: { family: 'Barlow', size: 11 } }, beginAtZero: true },
  },
};

function EmptyChart({ label }) {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', gap: 8 }}>
      <span style={{ fontSize: 32 }}>📊</span>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

export default function ProgressPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    sessionsAPI.stats({ period })
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return (
    <div className="page-container">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 200, marginBottom: 20, borderRadius: 12 }} />
      ))}
    </div>
  );


  const volumeEntries = Object.entries(stats?.volumeByDay || {})
    .sort(([a], [b]) => a.localeCompare(b));

  const volumeLabels = volumeEntries.map(([d]) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  });
  const volumeData = volumeEntries.map(([, v]) => v);


  const topExercises = Object.entries(stats?.exerciseFrequency || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const exLabels = topExercises.map(([name]) => name.length > 14 ? name.slice(0, 14) + '…' : name);
  const exData = topExercises.map(([, count]) => count);


  const sessionDots = (stats?.sessions || []).filter(s => s.duration > 0);
  const durLabels = sessionDots.map(s => {
    const d = new Date(s.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  const durData = sessionDots.map(s => Math.round((s.duration || 0) / 60));


  const moodCounts = (stats?.sessions || []).reduce((acc, s) => {
    if (s.mood) acc[s.mood] = (acc[s.mood] || 0) + 1;
    return acc;
  }, {});
  const moodLabels = Object.keys(moodCounts);
  const moodColors = {
    terrible: '#ff4757', bad: '#ff6b81', ok: '#ffa502',
    good: '#7bed9f', great: '#2ed573', amazing: '#e8ff3c',
  };

  return (
    <div className="page-container animate-fade">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2 }}>PROGRESS</h1>
        <div className="tab-bar" style={{ width: 'auto' }}>
          {[['7', '7 Days'], ['30', '30 Days'], ['90', '3 Months']].map(([val, label]) => (
            <button key={val} className={`tab-btn ${period === val ? 'active' : ''}`} onClick={() => setPeriod(val)}>
              {label}
            </button>
          ))}
        </div>
      </div>


      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Sessions', value: stats?.totalSessions || 0, color: 'var(--accent)' },
          { label: 'Total Volume', value: stats?.totalVolume ? `${(stats.totalVolume / 1000).toFixed(1)}t` : '0kg', color: 'var(--blue)' },
          { label: 'Avg Duration', value: stats?.avgDuration ? `${Math.round(stats.avgDuration / 60)}m` : '0m', color: 'var(--purple)' },
          { label: 'Exercises Used', value: Object.keys(stats?.exerciseFrequency || {}).length, color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Volume Over Time (kg)
          </h3>
          {volumeLabels.length < 2 ? (
            <EmptyChart label="Complete more sessions to see volume trends" />
          ) : (
            <div style={{ height: 200 }}>
              <Line
                data={{
                  labels: volumeLabels,
                  datasets: [{
                    label: 'Volume (kg)',
                    data: volumeData,
                    borderColor: '#e8ff3c',
                    backgroundColor: 'rgba(232,255,60,0.08)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#e8ff3c',
                    fill: true,
                    tension: 0.4,
                  }],
                }}
                options={BASE_OPTS}
              />
            </div>
          )}
        </div>


        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Top Exercises
          </h3>
          {exLabels.length === 0 ? (
            <EmptyChart label="Log workouts to see your top exercises" />
          ) : (
            <div style={{ height: 200 }}>
              <Bar
                data={{
                  labels: exLabels,
                  datasets: [{
                    data: exData,
                    backgroundColor: 'rgba(74,158,255,0.7)',
                    borderColor: '#4a9eff',
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={BASE_OPTS}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Session Duration (minutes)
          </h3>
          {durLabels.length < 2 ? (
            <EmptyChart label="Complete more sessions to see duration trends" />
          ) : (
            <div style={{ height: 180 }}>
              <Line
                data={{
                  labels: durLabels,
                  datasets: [{
                    label: 'Duration (min)',
                    data: durData,
                    borderColor: '#a55eea',
                    backgroundColor: 'rgba(165,94,234,0.08)',
                    borderWidth: 2,
                    pointRadius: 3,
                    fill: true,
                    tension: 0.3,
                  }],
                }}
                options={BASE_OPTS}
              />
            </div>
          )}
        </div>


        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Workout Mood
          </h3>
          {moodLabels.length === 0 ? (
            <EmptyChart label="Rate your sessions to see mood distribution" />
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <Doughnut
                  data={{
                    labels: moodLabels,
                    datasets: [{
                      data: moodLabels.map(m => moodCounts[m]),
                      backgroundColor: moodLabels.map(m => moodColors[m] || '#525d6e'),
                      borderWidth: 2,
                      borderColor: '#141820',
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TOOLTIP },
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {moodLabels.map(m => (
                  <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: moodColors[m], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-2)', textTransform: 'capitalize', flex: 1 }}>{m}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{moodCounts[m]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
