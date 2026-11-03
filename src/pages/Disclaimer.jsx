import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import { DISCLAIMER_CONTENT } from '../constants/disclaimerContent';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="Safety & Medical Disclaimer"
          subtitle="Important health, fitness, and algorithmic accuracy boundaries for training with FitNova."
          breadcrumb={[{ label: 'Disclaimer' }]}
        />

        {/* Coach's Note Card at Top */}
        <div className="mb-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#111424] via-[#161a32] to-[#111424] border border-[#ff5a36]/40 shadow-[0_16px_40px_-12px_rgba(255,90,54,0.3)] flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] shrink-0 mt-0.5 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Coach's Note
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ff5a36]/20 text-[#ff5a36] border border-[#ff5a36]/40">
                Core Safety Boundary
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {DISCLAIMER_CONTENT.coachNote}
            </p>
          </div>
        </div>

        {/* 2-Column Content: Sticky Table of Contents on Desktop + Article */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Table of Contents (Sticky on Desktop) */}
          <aside className="lg:col-span-4 sticky top-24 rounded-2xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#ff5a36] mb-4">
              Sections
            </h3>
            <nav className="space-y-2">
              {DISCLAIMER_CONTENT.sections.map((sec) => (
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

          {/* Main Disclaimer Content (max-w-3xl) */}
          <main className="lg:col-span-8 max-w-3xl space-y-10 text-slate-300 leading-relaxed text-base">
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Last updated: {DISCLAIMER_CONTENT.lastUpdated}</span>
            </div>

            {DISCLAIMER_CONTENT.sections.map((sec) => (
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
              </section>
            ))}
          </main>
        </div>
      </Container>
    </div>
  );
}
