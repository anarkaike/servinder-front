import { InferModel } from 'drizzle-orm';
import { user } from '../models/user';
import { role } from '../models/role';
import { permission } from '../models/permission';

export type User = InferModel<typeof user>;
export type Role = InferModel<typeof role>;
export type Permission = InferModel<typeof permission>;

export interface AuthUser extends User {
  roles: Role[];
}
