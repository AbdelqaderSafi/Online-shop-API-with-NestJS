import { User } from 'generated/prisma';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';
export const generatedUserSeed = () => {
  const seededUser: Omit<User, 'id' | 'createdAt' | 'isDeleted'> = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(['MERCHANT', 'CUSTOMER']),
  };
  return seededUser;
};

export const mainMerchant = async () =>
  ({
    name: 'Main Merchant',
    email: 'merchant@gmail.com',
    password: await argon.hash('123456'),
    role: 'MERCHANT',
  }) as const;
