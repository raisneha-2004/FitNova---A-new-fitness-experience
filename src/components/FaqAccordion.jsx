import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

/**
 * FAQ Items Data array
 * Easy to edit and customize
 */
const FAQ_ITEMS = [
  {
    question: 'Is my video uploaded anywhere?',
    answer:
      'No. Pose detection runs in your browser on your device. Zero video frames or personal camera feeds are ever sent to any remote server or external cloud.',
  },
  {
    question: 'Is FitNova free?',
    answer:
      'Yes, the core arena is free. You can perform bodyweight exercises, track real-time repetitions, view joint depth, and level up without any subscription.',
  },
  {
    question: 'Where should I place my camera?',
    answer:
      '6-8 feet away, full body in frame, with good lighting. Ensure your head, hips, knees, and ankles are clearly visible so the skeleton points turn green.',
  },
  {
    question: 'Is this medical advice?',
    answer:
      'No. It gives general movement guidance only. It is not physical therapy or medical advice. Consult a physician before beginning any strenuous workout routine.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors hover:border-[#ff5a36]/40"
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                id={`faq-question-${idx}`}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
              >
                <span className="text-base sm:text-lg font-bold text-white">
                  {item.question}
                </span>

                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-[#ff5a36] text-white border-[#ff5a36]'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-white/5">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
