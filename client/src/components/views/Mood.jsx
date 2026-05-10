import { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { useStore } from '../../store/useStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const moodIcons = { happy: 'fa-face-smile', neutral: 'fa-face-meh', stressed: 'fa-face-frown-open' };
const moodColors = { happy: 'var(--health)', neutral: 'var(--warm)', stressed: 'var(--danger)' };

export default function Mood() {
  const { moods, todayMood, logMood } = useStore();
  const last7 = moods.slice(0, 7).reverse();

  const labels = last7.map(m => new Date(m.createdAt || m.timestamp || Date.now()).toLocaleDateString('en', { weekday: 'short' }));
  const values = last7.map(m => m.mood === 'happy' ? 3 : m.mood === 'neutral' ? 2 : 1);
  const bgColors = last7.map(m =>
    m.mood === 'happy' ? 'rgba(123,171,142,0.6)' : m.mood === 'neutral' ? 'rgba(201,169,110,0.6)' : 'rgba(192,112,112,0.6)'
  );
  const borderColors = last7.map(m =>
    m.mood === 'happy' ? '#7BAB8E' : m.mood === 'neutral' ? '#C9A96E' : '#C07070'
  );

  return (
    <section className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mood Tracker</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '2px' }}>
          One tap to log. Your mood shapes task priorities.
        </p>
      </div>

      <p className="section-header">Log Today's Mood</p>
      <div className="mood-cards-row" style={{ marginBottom: '32px' }}>
        {[
          { key: 'happy', label: 'Happy', desc: 'Feeling good and energized' },
          { key: 'neutral', label: 'Neutral', desc: 'Calm, steady, in between' },
          { key: 'stressed', label: 'Stressed', desc: 'Overwhelmed or tense' },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className={`mood-card ${key} ${todayMood === key ? 'selected' : ''}`}
            onClick={() => logMood(key)}
            style={{ padding: '30px 20px' }}
          >
            <i className={`fa-solid ${moodIcons[key]}`} style={{ fontSize: '2.5rem' }}></i>
            <span className="mood-label" style={{ fontSize: '0.95rem', marginTop: '4px' }}>{label}</span>
            <p style={{ fontSize: '0.72rem', color: 'var(--fg-muted)', marginTop: '6px' }}>{desc}</p>
          </div>
        ))}
      </div>

      {todayMood && (
        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginTop: '-20px', marginBottom: '28px' }}>
          <i className="fa-solid fa-circle-check"></i> Today's mood has been recorded.
        </p>
      )}

      {moods.length > 0 ? (
        <>
          <p className="section-header">Recent Mood History</p>
          <div className="card" style={{ marginBottom: '28px' }}>
            {moods.slice(0, 7).map((m, i) => {
              const date = new Date(m.createdAt || m.timestamp || Date.now());
              const dateStr = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
              const isToday = m.date === new Date().toISOString().split('T')[0];
              return (
                <div key={m._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={`fa-solid ${moodIcons[m.mood]}`} style={{ color: moodColors[m.mood], fontSize: '1.1rem' }}></i>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, textTransform: 'capitalize' }}>{m.mood}</span>
                    {isToday && (
                      <span style={{ fontSize: '0.7rem', background: 'var(--accent-subtle)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>Today</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>{dateStr}</span>
                </div>
              );
            })}
          </div>

          {last7.length >= 2 && (
            <>
              <p className="section-header">7-Day Mood Trend</p>
              <div className="card">
                <Bar
                  data={{
                    labels,
                    datasets: [{ data: values, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 2, borderRadius: 6, barPercentage: 0.5 }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: { label: ctx => ['', 'Stressed', 'Neutral', 'Happy'][ctx.raw] || '' },
                        backgroundColor: 'rgba(30,33,36,0.9)',
                        padding: 10, cornerRadius: 8,
                      }
                    },
                    scales: {
                      y: { display: false, min: 0, max: 4 },
                      x: { grid: { display: false }, ticks: { color: 'var(--fg-muted)', font: { family: 'DM Sans', size: 11 } } }
                    }
                  }}
                  height={180}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-heart-pulse"></i>
          <p>No mood data yet. Start logging to see trends and improve your productivity insights.</p>
        </div>
      )}
    </section>
  );
}
