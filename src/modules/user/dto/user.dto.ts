import { User } from 'generated/prisma';

export type updateUserDTO = Partial<Pick<User, 'name' | 'email'>>;
