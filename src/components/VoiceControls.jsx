import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  AlertCircle,
  Settings2,
  Volume2,
  VolumeX,
  X,
  Check,
  HelpCircle,
  Shield,
  Sparkles,
} from 'lucide-react';
import { VOICE_COMMANDS, VOICE_LANGUAGES } from '../config/voiceConfig.js';

export default function VoiceControls({
  supported = true,
  listening = false,
  error = null,
  errorMessage = null,
  lastHeard = '',
  voiceToast = null, // { message, type }
  voiceSettings = { enabled: false, lang: 'en-IN', requirePrefix: false, hasAcceptedNotice: false },
  onUpdateSettings = null,
  onRequestPermission = null,
  isMuted = false,
  onToggleMute = null,
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  // Handle main mic button click
  const handleMicClick = () => {
    if (!supported) return;

    if (!voiceSettings.enabled) {
      // First time turning ON -> show privacy notice
      if (!voiceSettings.hasAcceptedNotice) {
        setShowNoticeModal(true);
      } else {
        if (onUpdateSettings) {
          onUpdateSettings({ ...voiceSettings, enabled: true });
        }
      }
    } else {
      // Turn OFF
      if (onUpdateSettings) {
        onUpdateSettings({ ...voiceSettings, enabled: false });
      }
    }
  };

  const handleAcceptNotice = () => {
    setShowNoticeModal(false);
    if (onUpdateSettings) {
      onUpdateSettings({ ...voiceSettings, enabled: true, hasAcceptedNotice: true });
    }
    if (onRequestPermission) {
      onRequestPermission();
    }
  };

  // Determine button state visual style:
  // off (gray), listening (orange with pulsing ring), error (amber)
  const isError = Boolean(error);
  const isListening = listening && voiceSettings.enabled && !isError;

  let buttonStyle = 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10';
  let buttonTitle = 'Enable voice commands (SpeechRecognition)';
  let ariaLabel = 'Voice commands disabled. Click to turn on.';

  if (!supported) {
    buttonStyle = 'bg-white/[0.02] text-slate-500 border-white/5 cursor-not-allowed opacity-60';
    buttonTitle = 'Voice commands work in Chrome or Edge';
    ariaLabel = 'Voice commands not supported in this browser';
  } else if (isError) {
    buttonStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20';
    buttonTitle = errorMessage || 'Voice recognition error';
    ariaLabel = 'Voice recognition error';
  } else if (isListening) {
    buttonStyle = 'bg-gradient-to-r from-[#ff5a36] to-amber-500 text-white border-white/20 shadow-lg shadow-[#ff5a36]/30';
    buttonTitle = 'Voice commands active (listening)';
    ariaLabel = 'Voice commands active and listening';
  }

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={popoverRef}>
      {/* Unsupported notice badge if browser lacks Web Speech API */}
      {!supported ? (
        <span
          className="text-[11px] font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
          title="Voice commands require Web Speech API (available in Chrome, Edge, Safari)"
        >
          Voice commands work in Chrome or Edge
        </span>
      ) : (
        <>
          {/* Main Voice Mic Button */}
          <div className="relative inline-flex items-center">
            {isListening && (
              <span className="absolute -inset-1 rounded-xl bg-[#ff5a36]/30 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              id="voice-commands-mic-btn"
              onClick={handleMicClick}
              className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${buttonStyle}`}
              title={buttonTitle}
              aria-label={ariaLabel}
            >
              {isListening ? (
                <Mic className="w-4 h-4 text-white animate-pulse" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              ) : (
                <MicOff className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Voice Settings Popover Toggle Button */}
          <button
            type="button"
            id="voice-settings-toggle-btn"
            onClick={() => setPopoverOpen((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
              popoverOpen
                ? 'bg-white/15 text-white border-[#ff5a36]/50'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title="Voice Commands Settings"
            aria-label="Open voice command settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Voice Settings Popover Card */}
      <AnimatePresence>
        {popoverOpen && supported && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-full mb-2 w-80 sm:w-96 rounded-2xl bg-[#0b0d17]/95 border border-white/15 backdrop-blur-xl p-4 shadow-2xl z-50 text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#ff5a36]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Voice Commands
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPopoverOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3.5 text-xs">
              {/* Voice ON/OFF Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Hands-Free Commands</span>
                  <span className="text-[11px] text-slate-400">Control workout with your voice</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceSettings.enabled}
                    onChange={(e) => {
                      const willEnable = e.target.checked;
                      if (willEnable && !voiceSettings.hasAcceptedNotice) {
                        setShowNoticeModal(true);
                      } else {
                        onUpdateSettings({ ...voiceSettings, enabled: willEnable });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff5a36]" />
                </label>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Speech Language</span>
                <select
                  value={voiceSettings.lang || 'en-IN'}
                  onChange={(e) => {
                    onUpdateSettings({ ...voiceSettings, lang: e.target.value });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff5a36]"
                >
                  {VOICE_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#111424] text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Require 'Arena' prefix toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="pr-2">
                  <span className="font-semibold text-white block">Require "Arena" prefix</span>
                  <span className="text-[11px] text-slate-400">
                    Say "Arena start" instead of just "start" to reduce false triggers
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={voiceSettings.requirePrefix}
                    onChange={(e) => {
                      onUpdateSettings({ ...voiceSettings, requirePrefix: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff5a36]" />
                </label>
              </div>

              {/* Audio feedback mute toggle */}
              {onToggleMute && (
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="font-semibold text-white">Coach Audio Feedback</span>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-red-400" />
                        <span>Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Voice On</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Command Reference Table */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Available Commands ({voiceSettings.requirePrefix ? '"Arena <command>"' : 'Direct'})
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {Object.values(VOICE_COMMANDS).map((cmd) => (
                  <div
                    key={cmd.id}
                    className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col"
                  >
                    <span className="font-bold text-slate-200">{cmd.label}</span>
                    <span className="text-[10px] text-[#ff5a36] font-medium truncate">
                      {cmd.example}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* First-time Privacy Acceptance Modal */}
      <AnimatePresence>
        {showNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full rounded-3xl bg-[#0b0d17] border border-white/15 p-6 shadow-2xl text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36] mb-4">
                <Shield className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight mb-2">
                Enable Hands-Free Voice Commands
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                <p>
                  Voice commands use your browser’s built-in <strong>SpeechRecognition API</strong> to recognize commands like <em>"Start"</em>, <em>"Pause"</em>, and <em>"Finish"</em> without touching your device.
                </p>
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-1">Privacy Notice</span>
                  In Chrome, spoken voice audio is processed client-side via Google's speech recognition service. FitNova does not record, transmit, or store any microphone recordings on any backend server. Your camera video never leaves your device.
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAcceptNotice}
                  className="btn-coral px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#ff5a36]/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Allow Microphone & Turn On</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
