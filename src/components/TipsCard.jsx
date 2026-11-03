import React from 'react';
import { Lightbulb, Move, Sun, ShieldAlert } from 'lucide-react';

export default function TipsCard() {
  const tips = [
    {
      icon: <Move className="w-4 h-4 text-coral" />,
      text: 'Position camera 6-8 feet away to capture your full body from head to toe.',
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-coral" />,
      text: 'Stand angled slightly or sideways to let the AI verify deep squat hip creases.',
    },
    {
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      text: 'Use good front lighting and avoid strong backlights behind you.',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-900/85 backdrop-blur-md p-5 shadow-lg">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-8 h-8 rounded-lg bg-coral/15 border border-coral/30 flex items-center justify-center text-coral">
          <Lightbulb className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Arena Setup Tips
        </span>
      </div>

      <ul className="space-y-2.5">
        {tips.map((tip, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300"
          >
            <span className="shrink-0 mt-0.5">{tip.icon}</span>
            <span className="leading-relaxed">{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
