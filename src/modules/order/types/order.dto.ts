import { Prisma } from 'generated/prisma';

export type CreateOrderDTO = {
  productId: number;
  totalQty: number;
}[];

// I don't want to get all fields of Order model, so we create a specific type to get just important fields
export type CreateOrderResponseDTO = Prisma.OrderGetPayload<{
  include: {
    orderProducts: { include: { product: true } };
    transactions: true;
    orderReturns: {
      include: { returnedItems: { include: { product: true } } };
    };
  };
}>;

// I want all fields for order response
export type OrderOverviewResponseDTO = Prisma.OrderGetPayload<{
  include: {
    orderProducts: true;
    transactions: true;
    orderReturns: true;
  };
}>;

export type CreateOrderReturnDTO = {
  orderId: number;
  items: { productId: number; totalQty: number }[];
};
