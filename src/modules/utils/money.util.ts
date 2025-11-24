import { Decimal } from 'generated/prisma/runtime/library';

export class MoneyUtil {
  // get total amount from list of items
  static calculateTotalAmount(
    items: { price: Decimal; quantity: number }[],
  ): Decimal {
    return items.reduce((total, item) => {
      return total.add(item.price.mul(item.quantity));
    }, new Decimal(0));
  }
}
