import { Injectable } from '@nestjs/common';
import type { CreateProductDTO, UpdateProductDTO } from './types/product.dto';
import { DatabaseService } from '../database/database.service';
import { ProductQuery } from './types/product.types';
import { Prisma } from 'generated/prisma/wasm';
import th from 'zod/v4/locales/th.js';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: DatabaseService) {}

  create(createProductDto: CreateProductDTO) {
    return 'This action adds a new product';
  }

  findAll(query: Required<Omit<ProductQuery, 'name'>> & { name?: string }) {
    return this.prismaService.$transaction(async (prisma) => {
      const whereClause: Prisma.ProductWhereInput = query.name
        ? {
            name: { contains: query.name },
          }
        : {};

      const products = await prisma.product.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        where: whereClause,
      });

      const count = await prisma.product.count({
        where: whereClause,
      });

      return {
        data: products,
        meta: {
          total: count,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(count / query.limit),
        },
      };
    });
  }

  findOne(id: bigint) {
    return this.prismaService.product.findUnique({
      where: { id: BigInt(id) },
    });
  }

  update(id: bigint, updateProductDto: UpdateProductDTO) {
    return `This action updates a #${id} product`;
  }

  remove(id: bigint) {
    return `This action removes a #${id} product`;
  }
}
