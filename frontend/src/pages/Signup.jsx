// ─── Signup Page ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'company' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e) => ({ ...e, [field]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');

    const result = await signup(form.name, form.email, form.password, form.role);
    setLoading(false);

    if (result.success) {
      navigate(form.role === 'company' ? '/company/dashboard' : '/user/dashboard');
    } else {
      setServerError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-snow flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex w-1/2 bg-ink flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-ink text-lg font-display font-bold font-sans">O</span>
            </div>
            <span className="text-white text-xl font-display font-semibold tracking-wider">OpsMindAI</span>
          </div>

          <h1 className="text-4xl font-display font-semibold text-white leading-tight mb-4">
            Get started with<br />SOP Intelligence.
          </h1>
          <p className="text-silver text-sm leading-relaxed max-w-sm">
            Whether you're a company managing SOPs or a user querying them —
            OpsMindAI brings your documents to life with AI.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '📄', text: 'Upload and manage SOP documents effortlessly' },
            { icon: '🤖', text: 'AI-powered Q&A across company documents' },
            { icon: '💬', text: 'Chat sessions with full conversation context' },
          ].map((f) => (
            <div key={f.text} className="flex items-start gap-3">
              <span className="text-xl">{f.icon}</span>
              <p className="text-silver text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-display font-bold">OM</span>
            </div>
            <span className="text-ink text-lg font-display font-semibold">OpsMindAI</span>
          </div>

          <h2 className="text-2xl font-display font-semibold text-ink mb-1">Create an account</h2>
          <p className="text-sm text-muted mb-8">Get started with OpsMindAI in minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-slate mb-2">I am registering as…</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'company', label: 'Company', sub: 'Upload & manage SOPs' },
                  { value: 'user', label: 'User', sub: 'Query company SOPs' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                    className={[
                      'p-3.5 rounded-xl border text-left transition-all duration-200',
                      form.role === r.value
                        ? 'border-ink bg-ink text-white'
                        : 'border-fog bg-white hover:border-silver text-ink',
                    ].join(' ')}
                  >
                    <p className="text-sm font-semibold font-body">{r.label}</p>
                    <p className={`text-xs mt-0.5 ${form.role === r.value ? 'text-silver' : 'text-muted'}`}>
                      {r.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label={form.role === 'company' ? 'Company Name' : 'Full Name'}
              type="text"
              placeholder={form.role === 'company' ? 'Acme Inc.' : 'John Doe'}
              value={form.name}
              onChange={handleChange('name')}
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
              />
              <Input
                label="Confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange('confirm')}
                error={errors.confirm}
              />
            </div>

            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-600">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-sm text-center text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ink font-medium hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
