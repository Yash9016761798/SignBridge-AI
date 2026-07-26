import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FirebaseService } from './firebase.service';
import { AuthenticatedUser } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async login(idToken: string): Promise<AuthenticatedUser> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);

      const user = await this.syncUser(decodedToken);

      this.logger.log(`User logged in: ${user.email}`);

      return user;
    } catch (error) {
      this.logger.error('Login failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(_idToken: string): Promise<void> {
    this.logger.log('User logged out');
  }

  async getCurrentUser(firebaseUid: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.mapUserToAuthenticatedUser(user);
  }

  async refreshToken(idToken: string): Promise<AuthenticatedUser> {
    return this.login(idToken);
  }

  private async syncUser(decodedToken: {
    uid: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
  }): Promise<AuthenticatedUser> {
    const { uid, email, name, email_verified } = decodedToken;

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'LEARNER' as const },
    });

    if (!defaultRole) {
      throw new UnauthorizedException('Default role not configured');
    }

    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: uid },
      include: { role: true },
    });

    if (user) {
      const updateData: Record<string, unknown> = {
        lastLoginAt: new Date(),
      };

      if (email && !user.isVerified && email_verified) {
        updateData.isVerified = true;
      }

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
        include: { role: true },
      });

      this.logger.log(`User updated: ${user.email}`);
    } else {
      const nameParts = name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || email?.split('@')[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = await this.prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email || `user-${uid}@placeholder.com`,
          firstName,
          lastName,
          roleId: defaultRole.id,
          isVerified: email_verified || false,
          lastLoginAt: new Date(),
        },
        include: { role: true },
      });

      this.logger.log(`New user created: ${user.email}`);
    }

    return this.mapUserToAuthenticatedUser(user);
  }

  private mapUserToAuthenticatedUser(user: {
    id: string;
    firebaseUid: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    organizationId: string | null;
    isVerified: boolean;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    role: { name: string };
  }): AuthenticatedUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      roleId: user.roleId,
      organizationId: user.organizationId || undefined,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  }
}
