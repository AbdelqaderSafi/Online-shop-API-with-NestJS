import { Injectable } from '@nestjs/common';
import type { CreateProductDTO, UpdateProductDTO } from './types/product.dto';
import { DatabaseService } from '../database/database.service';
import { ProductQuery } from './types/product.types';
import { Prisma } from 'generated/prisma/wasm';
import { FilesService } from '../files/files.service';
import { SideEffectQueue } from 'src/modules/utils/side.effects';
import { removeFields } from '../utils/object.util';

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

  findAll(query: ProductQuery) {
    return this.prismaService.$transaction(async (prisma) => {
      const whereClause: Prisma.ProductWhereInput = query.name
        ? {
            name: { contains: query.name },
          }
        : {};
      const pagination = this.prismaService.handleQueryPagination(query);
      const products = await prisma.product.findMany({
        ...removeFields(pagination, ['page']),
        where: whereClause,
      });

      const count = await prisma.product.count({
        where: whereClause,
      });

      return {
        data: products,
        ...this.prismaService.formatPaginationResponse({
          page: pagination.page,
          count,
          limit: pagination.take,
        }),
      };
    });
  }

  findOne(id: number) {
    return this.prismaService.product.findUnique({
      where: { id },
      include: { Assets: true },
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

  remove(id: number, user: Express.Request['user']) {
    return this.prismaService.product.update({
      where: { id, merchantId: Number(user!.id) },
      data: { isDeleted: true },
    });
  }
}
