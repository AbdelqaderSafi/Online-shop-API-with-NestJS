import { faker } from '@faker-js/faker';
import { PrismaClient } from 'generated/prisma';
import { generatedUserSeed, mainMerchant } from './user.seeds';
import { generatedProductSeed } from './product.seeds';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database has been cleaned.');

  const userSeeds = faker.helpers.multiple(() => generatedUserSeed(), {
    count: 10,
  });
  await prisma.user.createMany({
    //create users in db
    data: [...userSeeds, await mainMerchant()],
  });

  const merchantUser = await prisma.user.findMany({
    // get all merchants from db
    where: { role: 'MERCHANT' },
  });
  for (const merchant of merchantUser) {
    const productSeeds = faker.helpers.multiple(
      () => generatedProductSeed(merchant.id),
      // create 5 products for each merchant
      {
        count: 5,
      },
    );
    await prisma.product.createMany({
      data: productSeeds,
    });
  }
  console.log('Database seeding completed.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
