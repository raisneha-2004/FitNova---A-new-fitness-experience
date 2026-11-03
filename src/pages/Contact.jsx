import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bug,
  Sparkles,
  MessageSquare
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.76v8.37H6.46V10.9M7.84 6.7a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
    </svg>
  );
}

const TOPICS = [
  'Feedback',
  'Bug report',
  'Feature request',
  'Other',
];

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic') === 'bug' ? 'Bug report' : '';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: topicFromUrl || 'Feedback',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  // Client validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please provide your name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long.';
    } else if (formData.message.length > 1000) {
      errs.message = 'Message cannot exceed 1000 characters.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${apiUrl}/contact`, formData);

      if (response.data && response.data.success) {
        setIsSubmitted(true);
      } else {
        setServerError(response.data?.message || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to reach server. Please check your connection or try again later.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      topic: 'Feedback',
      message: '',
      honeypot: '',
    });
    setErrors({});
    setIsSubmitted(false);
    setServerError('');
  };

  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="Contact FitNova"
          subtitle="Send questions, bug reports, or feature ideas. Your feedback shapes the arena."
          breadcrumb={[{ label: 'Contact' }]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form (7 cols on desktop) */}
          <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl">
            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Thanks, we got your message!
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  We have recorded your submission. You will receive a response at{' '}
                  <strong className="text-white">{formData.email}</strong> within 2–3 business days.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-coral px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-[#ff5a36]/30"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Honeypot field (hidden from screen, catches automated bots) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="honeypot">Leave blank</label>
                  <input
                    type="text"
                    id="honeypot"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>

                {/* Server Error Alert */}
                {serverError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                  >
                    Name <span className="text-[#ff5a36]">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Vance"
                    maxLength={100}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                      errors.name ? 'border-red-500/60 ring-1 ring-red-500' : 'border-white/10'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                  >
                    Email <span className="text-[#ff5a36]">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. alex@example.com"
                    maxLength={150}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                      errors.email ? 'border-red-500/60 ring-1 ring-red-500' : 'border-white/10'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Topic */}
                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                  >
                    Topic <span className="text-[#ff5a36]">*</span>
                  </label>
                  <select
                    id="contact-topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#111424] border border-white/10 text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36]"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t} className="bg-[#111424] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                    >
                      Message <span className="text-[#ff5a36]">*</span>
                    </label>
                    <span
                      className={`text-xs ${
                        formData.message.length > 950 ? 'text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {formData.message.length} / 1000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={1000}
                    placeholder="Tell us what's on your mind or describe the bug..."
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36] resize-y ${
                      errors.message ? 'border-red-500/60 ring-1 ring-red-500' : 'border-white/10'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-coral w-full py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a36]/30 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Info & Tips Card (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Connect Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Direct Connect</h4>
                  <p className="text-xs text-slate-400">Created by Sneha Rai</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                <Clock className="w-4 h-4 text-[#ff5a36] shrink-0" />
                <span>Response time: Usually within 2–3 days.</span>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Social & Repositories
                </span>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="https://github.com/raisneha-2004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff5a36]/50 transition-colors flex items-center justify-between text-sm text-slate-200 hover:text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <GithubIcon className="w-4 h-4 text-[#ff5a36]" />
                      <span>github.com/raisneha-2004</span>
                    </span>
                    <span className="text-xs text-slate-500">↗</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/sneha-rai-a7157231a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff5a36]/50 transition-colors flex items-center justify-between text-sm text-slate-200 hover:text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <LinkedinIcon className="w-4 h-4 text-[#ff5a36]" />
                      <span>LinkedIn Profile</span>
                    </span>
                    <span className="text-xs text-slate-500">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* "Report a bug" Tip list */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#111424] to-[#14182e] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-[#ff5a36]">
                <Bug className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">How to Report a Bug</h4>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff5a36] shrink-0 mt-0.5" />
                  <span>State your browser version (Chrome, Edge, Brave, etc.).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff5a36] shrink-0 mt-0.5" />
                  <span>Describe camera behavior: did landmark dots turn green?</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff5a36] shrink-0 mt-0.5" />
                  <span>Include any console errors if visible.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
