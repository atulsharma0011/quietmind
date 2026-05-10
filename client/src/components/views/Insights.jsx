import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { api } from '../../api/client';
import { useStore } from '../../store/useStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Insights() {
  const { tasks, moods, addToast } = useStore();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.getInsights();
        setInsights(data);
      } catch (e) {
        addToast('Failed to load insights', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [tasks, moods]);

  if (loading) {
    return (
      <section className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Weekly Insights</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--fg-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
        </div>
      </section>
    );
  }

  if (!insights || (insights.totalTasks < 1 && !insights.totalMoodLogs)) {
    return (
      <section className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Weekly Insights</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '2px' }}>Patterns from the last 7 days</p>
        </div>
        <div className="empty-state">
          <i className="fa-solid fa-chart-line"></i>
          <p>Not enough data yet. Use QuietMind for a few days to see your productivity and wellness patterns.</p>
        </div>
      </section>
    );
  }

  const accentColor = '#6B9080';
  const chartData = {
    labels: insights.daily.map(d => d.day),
    datasets: [{
      label: 'Completed',
      data: insights.daily.map(d => d.completed),
      backgroundColor: accentColor + '99',
      borderColor: accentColor,
      borderWidth: 2,
      borderRadius: 6,
      barPercentage: 0.45,
    }]
  };

  return (
    <section className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Weekly Insights</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '2px' }}>Patterns from the last 7 days</p>
      </div>

      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{insights.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{insights.completedTasks}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: insights.stressedDays >= 3 ? 'var(--danger)' : 'var(--warm)' }}>{insights.stressedDays}</div>
          <div className="stat-label">Stressed Days</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ fontSize: '1.1rem', lineHeight: '2rem' }}>{insights.busiestDay ? insights.busiestDay[0] : 'N/A'}</div>
          <div className="stat-label">Busiest Day</div>
        </div>
      </div>

      <p className="section-header">Daily Task Completion</p>
      <div className="card" style={{ marginBottom: '28px' }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(30,33,36,0.9)',
                padding: 10, cornerRadius: 8,
                callbacks: {
                  afterLabel: (ctx) => {
                    const d = insights.daily[ctx.dataIndex];
                    return d.mood ? `Mood: ${d.mood}` : '';
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true, ticks: { stepSize: 1, color: 'var(--fg-muted)' },
                grid: { color: 'rgba(0,0,0,0.05)' }
              },
              x: {
                grid: { display: false },
                ticks: { color: 'var(--fg-muted)', font: { family: 'DM Sans', size: 11 } }
              }
            }
          }}
          height={200}
        />
      </div>

      <p className="section-header">Suggestions</p>
      <div className="card">
        {insights.suggestions.map((s, i) => (
          <div key={i} className="suggestion-item">
            <i className="fa-solid fa-lightbulb"></i>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
