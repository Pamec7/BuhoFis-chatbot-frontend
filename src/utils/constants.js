export const COLORS = {
  PRIMARY_BLUE: '#0582CA',
  DARK_BLUE: '#003D61',
  NAVY_BLUE: '#084062',
  GREEN: '#195427',
  LIGHT_GREEN: '#6EC971',
  PASTEL_GREEN: '#CCFFCE',
  LIGHT_BLUE: '#B3E5FC',
  DARK_BG: '#001a2e',
  DARK_BG_SECONDARY: '#002a4a',
  DARK_ACCENT: '#003554',
};

export const ROUTES = {
  LANDING: 'landing',
  HOME: 'home',
  CHAT: 'chat',
  HELP: 'help',
};

export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
};

export const MAX_MESSAGE_LENGTH = 500;

export const QUICK_ACTIONS = [
  { label: 'Malla curricular', icon: 'BookOpen' },
  { label: 'Trámites administrativos', icon: 'ClipboardList' },
  { label: 'Información General', icon: 'Info' },
];

// Validación de seguridad
export const SECURITY = {
  // Palabras prohibidas (ajustar según necesidad)
  BLOCKED_WORDS: ['script', 'eval', 'exec'],
  
  // Patrones peligrosos
  DANGEROUS_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe/gi,
    /javascript:/gi,
    /on\w+=/gi
  ]
};