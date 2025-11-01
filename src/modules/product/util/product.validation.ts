import { z, ZodType } from 'zod';
import { CreateProductDTO, UpdateProductDTO } from '../types/product.dto';

export const productValidationSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().min(0),
}) satisfies ZodType<CreateProductDTO>;

export const updateValidationSchema =
  productValidationSchema.partial() satisfies ZodType<
    Partial<UpdateProductDTO>
  >;
