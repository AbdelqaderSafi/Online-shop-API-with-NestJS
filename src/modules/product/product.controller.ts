import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseFilters,
} from '@nestjs/common';
import { ProductService } from './product.service';
import type {
  CreateProductDTO,
  ProductResponseDTO,
  UpdateProductDTO,
} from './types/product.dto';
import type { ProductQuery } from './types/product.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import {
  productPaginationSchema,
  productValidationSchema,
  updateProductValidationSchema,
} from './util/product.validation';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import { ImageKitExceptionFilter } from 'src/exceptions/exception';
import { FileCleanupInterceptor } from '../files/cleanup-files.interceptor';
import { IdempotencyInterceptor } from 'src/interceptor/idempotency.interceptor';

@Controller('product')
@Roles(['MERCHANT'])
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    IdempotencyInterceptor,
    FileInterceptor('file'),
    FileCleanupInterceptor,
  )
  @UseFilters(ImageKitExceptionFilter)
  create(
    @Body(new ZodValidationPipe(productValidationSchema))
    createProductDto: CreateProductDTO,
    @User() user: UserResponseDTO['userData'],
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ProductResponseDTO> {
    return this.productService.create(createProductDto, user, file);
  }

  @Roles(['MERCHANT', 'CUSTOMER'])
  @Get()
  findAll(
    @Query(new ZodValidationPipe(productPaginationSchema)) query: ProductQuery,
  ) {
    return this.productService.findAll(query);
  }

  @Roles(['MERCHANT', 'CUSTOMER'])
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    IdempotencyInterceptor,
    FileInterceptor('file'),
    FileCleanupInterceptor,
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateProductValidationSchema))
    updatePayload: UpdateProductDTO,
    @UploadedFile()
    file: Express.Multer.File,
    @User() user: UserResponseDTO['userData'],
  ): Promise<ProductResponseDTO> {
    return this.productService.update(id, updatePayload, user, file);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserResponseDTO['userData'],
  ) {
    return this.productService.remove(id, user);
  }
}
