import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, LoadingSpinner, AlertTriangleIcon } from '../components/Icons';

type AuthMode = 'login' | 'register';

interface FAQProps { q: string; a: string; index: number; }
const FAQItem: React.FC<FAQProps> = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl bg-white/5 backdrop-blur-md overflow-hidden">
      <button onClick={() => setOpen(o=>!o)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
        <span className="text-sm font-medium text-slate-200">{q}</span>
        <span className="text-xs text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-2 text-xs text-slate-300 leading-relaxed">{a}</div>
      )}
    </div>
  );
};

const HomePage: React.FC = () => {
  const { login, register, currentUser } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const toggleMode = () => setMode(m => m === 'login' ? 'register' : 'login');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (mode === 'login') await login(email, password); else await register(name, email, password);
    } catch (e: any) {
      setError(e?.message || 'Unexpected error');
    } finally { setLoading(false); }
  };

  if (currentUser) return null;

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden font-sans">
      {/* Keep existing plasma background */}
      <div className="plasma-wrapper pointer-events-none" aria-hidden="true">
        <div className="gradient gradient-1" />
        <div className="gradient gradient-2" />
        <div className="gradient gradient-3" />
      </div>

      {/* Site Header */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
            <LogoIcon className="h-9 w-9" />
            <span className="font-display tracking-wider text-xl">Aura</span>
        </div>
        <nav className="hidden lg:flex items-center gap-10 text-sm">
          <a href="#why" className="hover:text-brand-300 transition-colors">Why Aura</a>
          <a href="#features" className="hover:text-brand-300 transition-colors">Features</a>
          <a href="#how" className="hover:text-brand-300 transition-colors">How it Works</a>
          <a href="#faq" className="hover:text-brand-300 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => { setMode('login'); setAuthOpen(true); }} className="px-4 py-2 rounded-lg text-sm font-medium backdrop-blur bg-white/10 hover:bg-white/20 transition">Log In</button>
          <button onClick={() => { setMode('register'); setAuthOpen(true); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-500 via-brand-400 to-pink-500 hover:from-brand-600 hover:via-brand-500 hover:to-pink-600 shadow-md transition">Sign Up</button>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-12 pt-10 md:pt-24 pb-44 max-w-7xl mx-auto space-y-40">
        {/* Hero */}
        <section className="max-w-4xl">
          <p className="uppercase tracking-wider text-[11px] font-semibold text-brand-300/80 mb-4">AI EMOTIONAL INSIGHT PLATFORM</p>
          <h1 className="text-4xl md:text-6xl font-display font-semibold leading-tight drop-shadow-sm">
            Turn Daily Reflections into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-pink-400 to-teal-300">Actionable Clarity</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Aura is an AI‑powered diary that helps you capture emotions, surface hidden patterns, and receive gentle personalized suggestions for healthier mental habits.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button onClick={() => { setMode('register'); setAuthOpen(true); }} className="neon-ring relative px-7 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 via-brand-500 to-pink-500 hover:from-brand-700 hover:via-brand-600 hover:to-pink-600 shadow-lg">Get Started – Free</button>
            <button onClick={() => { setMode('login'); setAuthOpen(true); }} className="btn-glass px-7 py-3 rounded-xl text-sm font-medium">I already have an account</button>
          </div>
          <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1">No credit card</span>
            <span className="flex items-center gap-1">Private by design</span>
            <span className="flex items-center gap-1">Cancel anytime</span>
          </div>
        </section>

        {/* Why Aura */}
        <section id="why" className="space-y-14">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">Why Aura</h2>
            <p className="mt-4 text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">Traditional journals capture words. Aura decodes emotional context, trends, and subtle shifts—helping you course‑correct before burnout, overwhelm, or negative spirals deepen.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Emotional Intelligence', body: 'Extract core emotions & intensity per entry and watch longer‑term mood arcs emerge.' },
              { title: 'Meaningful Patterning', body: 'See triggers, recovery factors, and recurring contexts that shape your emotional state.' },
              { title: 'Gentle Guidance', body: 'Receive micro‑suggestions—not prescriptions—aligned to your writing tone & needs.' }
            ].map(card => (
              <div key={card.title} className="card-glow relative bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <h3 className="font-display text-lg mb-2 tracking-wide">{card.title}</h3>
                <p className="text-sm text-slate-200 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="space-y-16">
          <h2 className="font-display text-3xl md:text-4xl">Features</h2>
          <div className="grid lg:grid-cols-2 gap-14">
            {[
              { h: 'Adaptive Mood Insights', d: 'Weekly emotional deltas, stability scores, and emerging trends distilled from raw text.' },
              { h: 'Contextual AI Summaries', d: 'Entry summaries emphasize coping strategies, stressors, and growth signals—no generic fluff.' },
              { h: 'Tag & Title Intelligence', d: 'Aura helps auto‑surface recurring concepts so you can categorize without manual toil.' },
              { h: 'Offline Queue + Sync', d: 'Write anywhere—entries cache locally and sync safely when you reconnect.' },
              { h: 'Privacy‑First Storage', d: 'Your raw entries stay private. Analysis is scoped & minimized; no selling data.' },
              { h: 'Suggestion Engine', d: 'Personalized micro‑actions (breathing, reframing, recharge prompts) tuned by trends.' }
            ].map(f => (
              <div key={f.h} className="relative group">
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-brand-500/30 via-pink-500/30 to-teal-400/30 blur" />
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="font-display text-lg mb-2 tracking-wide">{f.h}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="space-y-14">
          <h2 className="font-display text-3xl md:text-4xl">How It Works</h2>
          <ol className="relative border-l border-white/10 ml-3 space-y-10 pl-8">
            {[
              { t: 'Write Naturally', d: 'Capture a thought, a feeling, or a long-form reflection—no required structure.' },
              { t: 'Aura Analyzes', d: 'We parse emotional tone, sentiment shifts, intensity, triggers, and recovery cues.' },
              { t: 'Surface Patterns', d: 'View aggregate dashboards: mood arcs, recurring tags, resilience indicators.' },
              { t: 'Receive Gentle Nudges', d: 'You get optional micro‑suggestions based on trending emotional signals.' },
              { t: 'Grow Intentionally', d: 'Track progress over weeks; celebrate adaptive reframes and healthier self‑talk.' }
            ].map((step, i) => (
              <li key={step.t} className="relative">
                <span className="absolute -left-[37px] top-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-pink-500 flex items-center justify-center text-[11px] font-semibold shadow-md">{i+1}</span>
                <h3 className="font-display text-lg mb-1">{step.t}</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{step.d}</p>
              </li>
            ))}
          </ol>
        </section>


        {/* Testimonials */}
        <section id="testimonials" className="space-y-14">
          <h2 className="font-display text-3xl md:text-4xl">What Users Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n:'Maya R.', r:'Product Designer', q:'Aura helped me notice subtle stress build‑ups before they snowballed. The weekly emotional arcs are gold.' },
                { n:'Leo S.', r:'Engineer', q:'The suggestions feel gentle—not pushy. It respects my space while still nudging healthier routines.' },
                { n:'Amira K.', r:'Therapist', q:'Client mode + pattern summaries make reflective homework far more actionable.' },
                { n:'Jon P.', r:'Student', q:'My late‑night rants now become structured insights the next day. Huge clarity boost.' },
                { n:'Sofia L.', r:'Writer', q:'The tone analysis lets me track self‑talk quality over time. Powerful mirror.' },
                { n:'Ravi T.', r:'Founder', q:'I journal more because Aura turns entries into feedback—without feeling like surveillance.' }
              ].map(t => (
                <figure key={t.n} className="relative flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <blockquote className="text-sm text-slate-200 leading-relaxed flex-1">“{t.q}”</blockquote>
                  <figcaption className="mt-4 text-xs text-slate-400">{t.n} • {t.r}</figcaption>
                </figure>
              ))}
            </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-10">
          <h2 className="font-display text-3xl md:text-4xl">FAQ</h2>
          <div className="space-y-4">
            {[
              { q:'Is my data private?', a:'Yes. Entries are stored securely; analysis minimizes exposure and nothing is sold or used for ads.' },
              { q:'Can I export my data?', a:'You can export entries (and soon insights) to portable formats like JSON or PDF in Pro.' },
              { q:'Does Aura work offline?', a:'Yes. Entries queue locally and sync when you reconnect—no data loss.' },
              { q:'Will suggestions feel invasive?', a:'They are optional, subtle, and adaptive. You can turn them off entirely.' },
              { q:'What AI models are used?', a:'We use domain‑tuned transformers for tone & pattern detection; nothing is trained on your private text.' }
            ].map((f,i) => (
              <FAQItem key={i} index={i} {...f} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-16 border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LogoIcon className="h-7 w-7" />
              <span className="font-display tracking-wide text-lg">Aura</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">AI‑assisted emotional journaling to cultivate clarity, resilience, and gentle self‑improvement.</p>
          </div>
          <div>
            <h4 className="font-display text-sm mb-3 tracking-wide">Product</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-slate-200">Features</a></li>
              <li><a href="#how" className="hover:text-slate-200">How It Works</a></li>
              <li><button onClick={() => { setMode('register'); setAuthOpen(true); }} className="hover:text-slate-200">Sign Up</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm mb-3 tracking-wide">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#faq" className="hover:text-slate-200">FAQ</a></li>
              <li><a href="#why" className="hover:text-slate-200">Why Aura</a></li>
              <li><a href="#testimonials" className="hover:text-slate-200">Testimonials</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-[10px] text-slate-500">© {new Date().getFullYear()} Aura. All rights reserved.</div>
      </footer>

      {authOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setAuthOpen(false)} />
          <div className="relative z-50 w-full max-w-md bg-slate-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in">
            <button onClick={() => setAuthOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 text-sm">✕</button>
            <h2 className="text-2xl font-display mb-6">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            {error && (
              <div className="mb-4 text-sm flex items-center bg-red-500/15 border border-red-500/40 text-red-300 px-3 py-2 rounded">
                <AlertTriangleIcon className="h-4 w-4 mr-2" /> {error}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400" />
              )}
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400" />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required minLength={6} className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400" />
              <button disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-brand-600 via-brand-500 to-pink-500 hover:from-brand-700 hover:via-brand-600 hover:to-pink-600 font-semibold disabled:opacity-50">
                {loading && <LoadingSpinner className="!text-white" />} {mode==='login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            <p className="mt-5 text-xs text-slate-400 text-center">
              {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}
              <button onClick={toggleMode} className="text-brand-300 hover:text-brand-200 font-medium">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
