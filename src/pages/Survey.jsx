import { useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const questions = [
  { key: 'alias', title: 'What should we call you?', subtitle: 'Choose a nickname. Please do not use your full name.', type: 'text', placeholder: 'Your alias', required: true },
  { key: 'age', title: 'How old are you?', subtitle: 'Enter your age in years.', type: 'number', placeholder: 'e.g. 15', required: true },
  { key: 'gender', title: 'How do you identify?', subtitle: 'This question is optional.', type: 'choice', optional: true, options: ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Another identity'] },
  { key: 'school_grade', title: 'What grade are you currently in?', type: 'choice', options: ['Middle school', '9th grade', '10th grade', '11th grade', '12th grade', 'University', 'Other'] },
  { key: 'main_interest', title: 'What interests you most about AI?', type: 'choice', options: ['School and learning', 'Creativity and entertainment', 'Science and technology', 'Future jobs and careers', 'Everyday life', 'I am not sure yet'] },
  { key: 'ai_knowledge', title: 'How would you describe your knowledge of AI?', type: 'choice', options: ['Beginner', 'I know a little', 'Intermediate', 'Advanced', 'I am not sure'] },
  { key: 'ai_usage_frequency', title: 'How often do you use AI tools?', type: 'choice', options: ['Every day', 'A few times a week', 'Once a week', 'A few times a month', 'Rarely', 'Never'] },
  { key: 'ai_opinion', title: 'What is your overall opinion about AI?', type: 'choice', options: ['Very positive', 'Somewhat positive', 'Neutral', 'Somewhat negative', 'Very negative', 'I am not sure'] },
  { key: 'employment_impact', title: 'Do you think AI will replace many jobs?', type: 'choice', options: ['Yes, many jobs', 'Yes, some jobs', 'No, it will mostly change jobs', 'No, not many jobs', 'I am not sure'] },
  { key: 'opportunities_risks', title: 'What do you think is the biggest opportunity or risk of AI?', subtitle: 'Share one thought in your own words.', type: 'textarea', placeholder: 'I think AI could…', required: true },
]

const initialAnswers = {
  alias: '', age: '', gender: '', school_grade: '', main_interest: '',
  ai_knowledge: '', ai_usage_frequency: '', ai_opinion: '',
  employment_impact: '', opportunities_risks: '',
}

export default function Survey() {
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState(initialAnswers)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const question = questions[step]
  const progress = useMemo(() => step < 0 ? 0 : Math.round(((step + 1) / questions.length) * 100), [step])

  function update(value) {
    setAnswers(prev => ({ ...prev, [question.key]: value }))
    setError('')
  }

  function validate() {
    const value = answers[question.key]
    if (question.optional) return true
    if (value === '' || value == null) return false
    if (question.key === 'age') return Number.isInteger(Number(value)) && Number(value) >= 13 && Number(value) <= 100
    if (question.key === 'alias') return value.trim().length >= 2 && value.trim().length <= 40
    if (question.key === 'opportunities_risks') return value.trim().length >= 5
    return true
  }

  async function next() {
    if (!validate()) {
      setError(question.key === 'age' ? 'Enter an age from 13 to 100.' : 'Please complete this answer before continuing.')
      return
    }
    if (step < questions.length - 1) {
      setStep(s => s + 1)
      return
    }
    await submit()
  }

  async function submit() {
    if (!isSupabaseConfigured) {
      setError('The form is not connected yet. Add your Supabase URL and publishable key in the project settings.')
      return
    }
    setBusy(true)
    setError('')
    const payload = {
      submission_id: crypto.randomUUID(),
      survey_version: 1,
      alias: answers.alias.trim(),
      age: Number(answers.age),
      gender: answers.gender || null,
      school_grade: answers.school_grade,
      main_interest: answers.main_interest,
      ai_knowledge: answers.ai_knowledge,
      ai_usage_frequency: answers.ai_usage_frequency,
      ai_opinion: answers.ai_opinion,
      employment_impact: answers.employment_impact,
      opportunities_risks: answers.opportunities_risks.trim(),
    }
    const { error: insertError } = await supabase.from('survey_responses').insert(payload)
    setBusy(false)
    if (insertError) {
      setError(`We couldn't submit your response: ${insertError.message}`)
      return
    }
    setComplete(true)
  }

  if (complete) return (
    <section className="survey-shell success-screen">
      <div className="success-icon">✓</div>
      <p className="eyebrow">RESPONSE RECEIVED</p>
      <h1>Thank you for sharing your perspective.</h1>
      <p className="lead">Your response has been submitted. Your contribution helps us understand how students think about artificial intelligence.</p>
      <a className="button button-primary" href="/">Back to home</a>
    </section>
  )

  if (step === -1) return (
    <section className="hero-shell">
      <div className="hero-copy">
        <p className="eyebrow">A STUDENT PERSPECTIVE ON ARTIFICIAL INTELLIGENCE</p>
        <h1>The future of AI is being shaped by <em>all of us.</em></h1>
        <p className="lead">What do students really think about artificial intelligence? Share your perspective in a short survey.</p>
        <div className="hero-meta"><span>10 questions</span><span>·</span><span>About 3 minutes</span><span>·</span><span>Gender is optional</span></div>
        <button className="button button-primary" onClick={() => setStep(0)}>Start the survey <span>→</span></button>
        <p className="small-note">Use an alias instead of your full name. Do not include personal or sensitive information.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
        <div className="ai-orb">AI<span>✳</span></div>
        <div className="floating-card card-one">Ideas <b>↗</b></div>
        <div className="floating-card card-two">People <b>◎</b></div>
        <div className="floating-card card-three">Future <b>✦</b></div>
      </div>
    </section>
  )

  return (
    <section className="survey-shell">
      <div className="progress-head"><span>QUESTION {step + 1} OF {questions.length}</span><span>{progress}%</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="question-transition" key={step}>
      <p className="eyebrow">THE AI PERSPECTIVE</p>
      <h1 className="question-title">{question.title}</h1>
      {question.subtitle && <p className="question-subtitle">{question.subtitle}</p>}
      <div className="answer-area">
        {question.type === 'choice' && <div className="choice-grid">
          {question.options.map(option => (
            <button key={option} type="button" className={`choice ${answers[question.key] === option ? 'selected' : ''}`} onClick={() => update(option)}>
              <span>{option}</span><span className="choice-check">{answers[question.key] === option ? '✓' : ''}</span>
            </button>
          ))}
        </div>}
        {question.type === 'text' && <input className="text-input" value={answers[question.key]} onChange={e => update(e.target.value)} placeholder={question.placeholder} maxLength={40} autoComplete="off" />}
        {question.type === 'number' && <input className="text-input age-input" type="number" min="13" max="100" value={answers[question.key]} onChange={e => update(e.target.value)} placeholder={question.placeholder} />}
        {question.type === 'textarea' && <textarea className="text-input textarea" value={answers[question.key]} onChange={e => update(e.target.value)} placeholder={question.placeholder} maxLength={500} rows={5} />}
        {question.optional && <button className="skip-button" onClick={() => { update(''); setStep(s => s + 1) }}>Skip this question</button>}
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="button button-quiet" onClick={() => { setError(''); setStep(s => Math.max(0, s - 1)) }} disabled={step === 0}>Back</button>
        <button className="button button-primary" onClick={next} disabled={busy}>{busy ? 'Submitting…' : step === questions.length - 1 ? 'Submit response' : 'Continue'} <span>→</span></button>
      </div>
    </div>  
    </section>
  )
}
