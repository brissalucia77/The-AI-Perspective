import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend,
} from 'chart.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const palette = ['#5CC48A', '#F2B544', '#1F2A5A', '#9BB6A8', '#D98D72', '#B7A8D8']

export default function Dashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Add the Supabase environment variables to load live results.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('public_response_records')
      .select('display_key,age_band,school_grade,main_interest,ai_knowledge,ai_usage_frequency,ai_opinion,employment_impact,opportunities_risks')
      .order('display_key', { ascending: true })
    if (queryError) setError(`Dashboard data could not be loaded: ${queryError.message}`)
    else setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const countBy = key => rows.reduce((acc, row) => {
    const label = row[key] || 'Not provided'
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const mostCommon = key => {
    const entries = Object.entries(countBy(key)).sort((a, b) => b[1] - a[1])
    return entries[0]?.[0] || '—'
  }
  const opinionCounts = countBy('ai_opinion')
  const frequencyCounts = countBy('ai_usage_frequency')
  const opinionData = {
    labels: Object.keys(opinionCounts),
    datasets: [{ data: Object.values(opinionCounts), backgroundColor: palette, borderWidth: 3, borderColor: '#FDFCFA' }],
  }
  const frequencyData = {
    labels: Object.keys(frequencyCounts),
    datasets: [{ label: 'Responses', data: Object.values(frequencyCounts), backgroundColor: '#5CC48A', borderRadius: 8 }],
  }
  const commonAge = mostCommon('age_band')
  const commonOpinion = mostCommon('ai_opinion')
  const commonGrade = mostCommon('school_grade')

  return (
    <section className="dashboard-shell">
      <div className="dashboard-heading">
        <div><p className="eyebrow">THE AI PERSPECTIVE / INSIGHTS</p><h1>What students think about AI.</h1><p className="lead">A snapshot of the responses available for public reporting.</p></div>
        <button className="button button-secondary" onClick={load}>↻ Refresh</button>
      </div>
      {error && <div className="notice error-notice">{error}</div>}
      <div className="stats-grid">
        <article className="stat-card stat-feature"><span>PUBLIC RESPONSES</span><strong>{loading ? '…' : rows.length}</strong><small>Responses currently available to this dashboard</small></article>
        <article className="stat-card"><span>MOST COMMON AGE BAND</span><strong className="stat-word">{loading ? '…' : commonAge}</strong></article>
        <article className="stat-card"><span>MOST COMMON OPINION</span><strong className="stat-word">{loading ? '…' : commonOpinion}</strong></article>
        <article className="stat-card"><span>MOST COMMON GRADE</span><strong className="stat-word">{loading ? '…' : commonGrade}</strong></article>
      </div>
      {!loading && !error && rows.length === 0 && <div className="notice">No public results are available yet. The privacy rules may keep results hidden until the minimum response threshold is reached.</div>}
      <div className="charts-grid">
        <article className="panel"><div className="panel-heading"><div><p className="eyebrow">OVERALL SENTIMENT</p><h2>Opinions about AI</h2></div></div>
          {rows.length > 0 ? <div className="chart-wrap"><Doughnut data={opinionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } } } }} /></div> : <div className="chart-empty">Waiting for public results</div>}
        </article>
        <article className="panel"><div className="panel-heading"><div><p className="eyebrow">AI HABITS</p><h2>How often students use AI</h2></div></div>
          {rows.length > 0 ? <div className="chart-wrap"><Bar data={frequencyData} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { grid: { display: false } } } }} /></div> : <div className="chart-empty">Waiting for public results</div>}
        </article>
      </div>
      <article className="panel response-panel">
        <div className="panel-heading"><div><p className="eyebrow">ANONYMIZED DATA</p><h2>Public response records</h2></div><span className="record-count">{rows.length} records</span></div>
        <div className="table-scroll"><table><thead><tr><th>Display key</th><th>Age band</th><th>School grade</th><th>Main interest</th><th>AI knowledge</th><th>Usage frequency</th><th>AI opinion</th><th>Employment impact</th><th>Opportunities / risks</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.display_key}><td className="key-cell">{String(row.display_key).slice(0, 8)}…</td><td>{row.age_band}</td><td>{row.school_grade}</td><td>{row.main_interest}</td><td>{row.ai_knowledge}</td><td>{row.ai_usage_frequency}</td><td>{row.ai_opinion}</td><td>{row.employment_impact}</td><td>{row.opportunities_risks}</td></tr>)}</tbody>
        </table></div>
        <p className="small-note">Only fields returned by the public reporting table are displayed. Individual names and exact ages are not requested here.</p>
      </article>
    </section>
  )
}
