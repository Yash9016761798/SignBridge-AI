export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    aiUrl: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000',
    version: 'v1',
  },
  auth: {
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    },
  },
  app: {
    name: 'SignBridge AI',
    description: 'Breaking Communication Barriers Through Indian Sign Language',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  features: {
    enableAI: process.env.NEXT_PUBLIC_ENABLE_AI === 'true',
    enableOffline: process.env.NEXT_PUBLIC_ENABLE_OFFLINE === 'true',
  },
} as const;

export type Config = typeof config;
