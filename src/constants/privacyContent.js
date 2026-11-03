/**
 * Privacy Policy Content Constants
 * FitNova - Last updated: 31 October 2026
 */
export const PRIVACY_CONTENT = {
  lastUpdated: '31 October 2026',
  studentNote:
    'FitNova is an educational student project created for interactive biomechanical feedback. It is not a commercial enterprise or medical service.',
  sections: [
    {
      id: 'camera-privacy',
      title: 'Your camera stays on your device',
      content: [
        'FitNova uses Google MediaPipe machine learning technology running client-side inside your browser (WebAssembly & WebGL).',
        'All camera frames are analyzed instantaneously in computer memory on your device to compute 33 skeletal body landmarks. No video frames, photographs, or camera feeds are ever sent, streamed, uploaded, or stored on our servers or third-party clouds.',
      ],
    },
    {
      id: 'what-we-store',
      title: 'What we store (Guest-first, No Accounts)',
      content: [
        'FitNova operates entirely on a guest-first model. We do not require accounts, logins, emails, or passwords.',
        'We only store your chosen guest nickname, selected avatar crest, and workout telemetry to power your gamification experience: completed repetitions, XP points, current character level, daily streaks, personal best records, unlocked badges, and session timestamps.',
        'These stats are stored primarily in your browser’s localStorage. When our optional backend is online, progress may optionally synchronize with an anonymous guest ID for leaderboard ranking.',
      ],
    },
    {
      id: 'public-leaderboard',
      title: 'Public Leaderboard and Data Control',
      content: [
        'The public leaderboard displays verified athlete rankings across daily, weekly, and all-time timeframes.',
        'Data stored on our server is strictly limited to: guest nickname, 4-digit discriminator tag, avatar identifier, XP totals (today, week, total), streak, character level, and a hashed secret token used to protect your entry.',
        'Zero video feeds, webcam images, audio recordings, email addresses, or real names are ever uploaded or retained on any server.',
        'Full player control: You can disable leaderboard participation at any time using the "Show me on the public leaderboard" toggle in your profile or workout summary.',
        'Permanent deletion: You can remove your entry from our leaderboard at any time with a single click using the "Remove me from leaderboard" button in your profile settings.',
      ],
    },
    {
      id: 'contact-data',
      title: 'Contact form data',
      content: [
        'When you submit a message through our Contact page, we collect your name, email address, selected topic, and message text solely to read and reply to your inquiry.',
        'We never use contact form submissions for marketing newsletters or promotional campaigns.',
      ],
    },
    {
      id: 'cookies-storage',
      title: 'Cookies and local storage',
      content: [
        'We do not use tracking or advertising cookies. We only use browser localStorage keys to retain your guest profile and workout history across sessions:',
        '• fq_player: Your guest ID, chosen nickname, and avatar ID',
        '• fq_progress: Your current XP, level, total reps, and streak',
        '• fq_sessions: Timestamps, reps, and accuracy of your workout history',
        '• fq_badges: Unlocked achievement badges and award timestamps',
        '• fq_daily: Daily rotating challenge progress, claim status, and reset tracking',
        '• fq_lb_token: Secret anti-hijacking token for secure self-service deletion of your leaderboard entry',
        '• fq_lb_optin: Your preference on whether your workout results appear on the public leaderboard',
        '• fq_rules_accepted: Records when you acknowledge the arena safety disclaimer',
        '• fq_voice: Stores your hands-free voice command preferences (enabled, language, prefix requirement)',
      ],
    },
    {
      id: 'voice-commands',
      title: 'Voice commands (optional)',
      content: [
        'FitNova provides an optional hands-free voice control feature on the Live Arena page powered by your web browser’s Web Speech API (SpeechRecognition / webkitSpeechRecognition).',
        'Voice commands are disabled by default. The microphone is only requested after you explicitly enable the feature and accept the voice notice.',
        'FitNova does not record, stream, collect, or store any microphone audio, voice recordings, or speech transcripts on any servers. Audio processing is handled by the browser engine (e.g. Google speech service in Chrome).',
        'You can turn voice commands off at any moment using the microphone button or the voice settings popover.',
      ],
    },
    {
      id: 'third-parties',
      title: 'Third parties',
      content: [
        'MediaPipe model binary files (.wasm and .task) are loaded from Google’s public CDN (jsdelivr.net / storage.googleapis.com).',
        'We do not sell, rent, monetize, or broker any user data to data brokers, analytics companies, or advertising networks.',
      ],
    },
    {
      id: 'your-choices',
      title: 'Your choices',
      content: [
        'You have full control over your workout data at all times. You can wipe your local records with one click using the button below or email us to request removal of any stored stats.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      content: [
        'FitNova is not intended for or directed to children under the age of 13. We do not knowingly collect personal information from children.',
      ],
    },
  ],
};
