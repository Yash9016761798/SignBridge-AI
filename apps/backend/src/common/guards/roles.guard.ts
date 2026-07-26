import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('Role check failed: no user found');
      throw new ForbiddenException('Authentication required');
    }

    const userRole = user.role || user.roleName;

    if (!userRole) {
      this.logger.warn(`User ${user.id} has no role assigned`);
      throw new ForbiddenException('No role assigned');
    }

    const hasRole = requiredRoles.some((role) => role.toLowerCase() === userRole.toLowerCase());

    if (!hasRole) {
      this.logger.warn(
        `User ${user.id} with role ${userRole} attempted to access endpoint requiring ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
