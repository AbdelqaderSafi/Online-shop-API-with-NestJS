import { z, ZodType } from 'zod';
import { CreateProductDTO, UpdateProductDTO } from '../types/product.dto';
import { paginationSchema } from 'src/modules/utils/api.util';
import { ProductQuery } from '../types/product.types';

export const productValidationSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(1000),
  price: z.coerce.number().min(0),
}) satisfies ZodType<CreateProductDTO>;

export const updateProductValidationSchema =
  productValidationSchema.partial() satisfies ZodType<
    Partial<UpdateProductDTO>
  >;

export const productPaginationSchema = paginationSchema.extend({
  name: z.string().min(1).max(255).optional(),
}) satisfies ZodType<ProductQuery>;
