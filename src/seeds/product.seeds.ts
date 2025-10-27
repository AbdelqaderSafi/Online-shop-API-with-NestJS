import { Product } from 'generated/prisma';
import { faker } from '@faker-js/faker';

export const generatedProductSeed = (merchantId: bigint) => {
  const seededProduct: Omit<Product, 'id' | 'createdAt' | 'price'> & {
    price: number;
  } = {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    imageUrl: faker.image.url(),
    merchantId,
  };
  return seededProduct;
};
