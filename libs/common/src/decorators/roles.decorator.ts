import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constant';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
