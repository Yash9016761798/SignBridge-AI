import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

interface DecodedIdToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  aud: string;
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  auth_time: number;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
  };
}

interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: unknown[];
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not configured. Running in development mode without Firebase verification.',
      );
      return;
    }

    try {
      this.app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized, returning mock token');
      return this.createMockToken(idToken);
    }

    try {
      const auth = getAuth(this.app);
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken as unknown as DecodedIdToken;
    } catch (error) {
      this.logger.error('Failed to verify Firebase ID token', error);
      throw error;
    }
  }

  async getUser(uid: string): Promise<UserRecord> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized, returning mock user');
      return this.createMockUser(uid);
    }

    try {
      const auth = getAuth(this.app);
      const userRecord = await auth.getUser(uid);
      return userRecord as unknown as UserRecord;
    } catch (error) {
      this.logger.error(`Failed to get Firebase user: ${uid}`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    if (!this.app) {
      return null;
    }

    try {
      const auth = getAuth(this.app);
      const userRecord = await auth.getUserByEmail(email);
      return userRecord as unknown as UserRecord;
    } catch {
      return null;
    }
  }

  private createMockToken(token: string): DecodedIdToken {
    return {
      uid: 'mock-uid-' + token.substring(0, 8),
      email: 'mock@example.com',
      email_verified: true,
      aud: 'mock-project',
      iss: 'https://securetoken.google.com/mock-project',
      sub: 'mock-uid-' + token.substring(0, 8),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      auth_time: Math.floor(Date.now() / 1000),
      firebase: {
        identities: { email: ['mock@example.com'] },
        sign_in_provider: 'password',
      },
    };
  }

  private createMockUser(uid: string): UserRecord {
    return {
      uid,
      email: 'mock@example.com',
      displayName: 'Mock User',
      emailVerified: true,
      disabled: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      providerData: [],
    };
  }
}
