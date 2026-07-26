import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from '../constants';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request[CURRENT_USER_KEY] || request.user;

    if (!user) {
      return null;
    }

    return data ? user?.[data] : user;
  },
);
