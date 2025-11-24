import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/decorators/roles.decorator';
import type {
  CreateOrderDTO,
  CreateOrderResponseDTO,
  CreateOrderReturnDTO,
  OrderOverviewResponseDTO,
} from './types/order.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import {
  createOrderDTOValidationSchema,
  createOrderReturnDTOValidationSchema,
} from './util/order.validation.schema';
import type {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/util.types';
import { paginationSchema } from '../utils/api.util';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import { IdempotencyInterceptor } from 'src/interceptor/idempotency.interceptor';

@Controller('order')
@Roles(['CUSTOMER'])
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  create(
    @Body(new ZodValidationPipe(createOrderDTOValidationSchema))
    createOrderDto: CreateOrderDTO,
    @User() user: UserResponseDTO['userData'],
  ): Promise<CreateOrderResponseDTO> {
    return this.orderService.create(createOrderDto, BigInt(user.id));
  }

  @Get()
  findAll(
    @User() user: UserResponseDTO['userData'],
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQueryType,
  ): Promise<PaginationResponseType<OrderOverviewResponseDTO>> {
    return this.orderService.findAll(BigInt(user.id), query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @User() user: UserResponseDTO['userData'],
  ): Promise<CreateOrderResponseDTO> {
    return this.orderService.findOne(Number(id), BigInt(user.id));
  }

  // returns end points

  // create return
  @Post('return')
  @UseInterceptors(IdempotencyInterceptor)
  createReturn(
    @Body(new ZodValidationPipe(createOrderReturnDTOValidationSchema))
    createReturnDto: CreateOrderReturnDTO,
    @User() user: UserResponseDTO['userData'],
  ): Promise<CreateOrderResponseDTO> {
    return this.orderService.createReturn(createReturnDto, BigInt(user.id));
  }
}
