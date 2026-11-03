import React, { useState } from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import { PRIVACY_CONTENT } from '../constants/privacyContent';
import { Shield, Trash2, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const [clearedNotice, setClearedNotice] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Clears all fq_* keys from localStorage
  const handleClearData = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fq_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      setShowConfirm(false);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 4500);
    } catch (e) {
      console.warn('Failed to clear localStorage keys:', e);
    }
  };

  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="Privacy Policy"
          subtitle="How FitNova protects your privacy with local-first, zero-video-upload computer vision."
          breadcrumb={[{ label: 'Privacy' }]}
        />

        {/* Date and Student Notice banner */}
        <div className="mb-10 p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ff5a36] shrink-0" />
            <span>
              Last updated: <strong className="text-slate-200">{PRIVACY_CONTENT.lastUpdated}</strong>
            </span>
          </div>
          <span className="text-slate-500 italic">
            {PRIVACY_CONTENT.studentNote}
          </span>
        </div>

        {/* 2-Column Content: Sticky Table of Contents on Desktop + Article */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Table of Contents (Sticky on Desktop) */}
          <aside className="lg:col-span-4 sticky top-24 rounded-2xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#ff5a36] mb-4">
              Table of Contents
            </h3>
            <nav className="space-y-2">
              {PRIVACY_CONTENT.sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all py-1"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Policy Content (max-w-3xl) */}
          <main className="lg:col-span-8 max-w-3xl space-y-10 text-slate-300 leading-relaxed text-base">
            {PRIVACY_CONTENT.sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="scroll-mt-24 pt-2">
                <h2 className="text-2xl font-black text-white tracking-tight mb-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#ff5a36]" />
                  {sec.title}
                </h2>
                <div className="space-y-3 text-slate-300">
                  {sec.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Interactive Action for "Your choices" section */}
                {sec.id === 'your-choices' && (
                  <div className="mt-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <h4 className="text-base font-bold text-white">
                      Manage Local Fitness Storage
                    </h4>
                    <p className="text-sm text-slate-400">
                      You can instantly delete all local exercise counters, XP records, and streak scores saved in your browser.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      {!showConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowConfirm(true)}
                          className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 hover:bg-red-500/20 text-slate-200 hover:text-red-400 border border-white/15 hover:border-red-500/40 transition-colors inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Clear my local data</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 p-2 bg-red-500/10 border border-red-500/30 rounded-xl">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-xs text-red-300 font-medium">Are you sure?</span>
                          <button
                            type="button"
                            onClick={handleClearData}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            className="px-3 py-1 bg-white/10 text-slate-300 rounded-lg text-xs font-medium hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <a
                        href="mailto:contact@fitnova.app?subject=Data%20Deletion%20Request"
                        className="text-xs sm:text-sm text-[#ff5a36] hover:underline inline-flex items-center gap-1.5 font-semibold"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Request account deletion via email</span>
                      </a>
                    </div>

                    {clearedNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>All FitNova local storage keys (fq_*) have been cleared.</span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            ))}
          </main>
        </div>
      </Container>
    </div>
  );
}
