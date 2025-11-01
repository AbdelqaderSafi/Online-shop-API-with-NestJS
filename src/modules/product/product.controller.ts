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
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { ProductService } from './product.service';
import type { CreateProductDTO, UpdateProductDTO } from './types/product.dto';
import type { ProductQuery } from './types/product.types';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createProductDto: CreateProductDTO,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    console.log(file);
    return 'file saved';
  }

  @Get()
  findAll(@Query() query: ProductQuery) {
    // return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: bigint) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: bigint, @Body() updateProductDto: UpdateProductDTO) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: bigint) {
    return this.productService.remove(id);
  }
}
