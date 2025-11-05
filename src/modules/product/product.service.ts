import { Injectable } from '@nestjs/common';
import type { CreateProductDTO, UpdateProductDTO } from './types/product.dto';
import { DatabaseService } from '../database/database.service';
import { ProductQuery } from './types/product.types';
import { Prisma } from 'generated/prisma/wasm';
import { FilesService } from '../files/files.service';
import { SideEffectQueue } from 'src/modules/utils/side.effects';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly filesService: FilesService,
  ) {}

  create(
    createProductDto: CreateProductDTO,
    user: Express.Request['user'],
    file?: Express.Multer.File,
  ) {
    const dataPayload: Prisma.ProductUncheckedCreateInput = {
      ...createProductDto,
      merchantId: Number(user!.id),
    };
    if (file) {
      dataPayload.Assets = {
        create: this.filesService.createFileAssetData(file, Number(user!.id)),
      };
    }

    return this.prismaService.product.create({
      data: dataPayload,
      include: { Assets: true },
    });
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

  async update(
    id: number,
    updatePayload: UpdateProductDTO,
    user: Express.Request['user'],
    file?: Express.Multer.File,
  ) {
    // get instance side effects queue
    const sideEffects = new SideEffectQueue();

    // run prisma transaction { invoke fileservice.deleteFile (prismaTX, productId, user, sideEffect) , prismaUpdate }
    const updatedProduct = await this.prismaService.$transaction(
      async (prismaTX) => {
        // if file is present, delete old file asset
        if (file) {
          await this.filesService.deleteProductAsset(
            prismaTX,
            id,
            Number(user!.id),
            sideEffects,
          );
        }
        const dataPayload: Prisma.ProductUncheckedUpdateInput = {
          ...updatePayload,
        };
        if (file) {
          dataPayload.Assets = {
            create: this.filesService.createFileAssetData(
              file,
              Number(user!.id),
            ),
          };
        }
        return await prismaTX.product.update({
          where: { id: BigInt(id) },
          data: dataPayload,
          include: { Assets: true },
        });
      },
    );
    // execute side effects
    await sideEffects.runAll();
    return updatedProduct;
  }

  remove(id: bigint) {
    return `This action removes a #${id} product`;
  }
}
