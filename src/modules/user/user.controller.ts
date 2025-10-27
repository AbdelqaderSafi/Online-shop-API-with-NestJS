import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { PaginationQueryType } from 'src/types/util.types';
import type { updateUserDTO } from './dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import { updateUserSchema } from './util/user.validation.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: PaginationQueryType = { limit: 10, page: 1 }) {
    return this.userService.findAll({
      limit: Number(query.limit),
      page: Number(query.page),
    } as Required<PaginationQueryType>);
  }

  @Get(':id')
  findOne(@Param('id') id: bigint) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: bigint,
    @Body(new ZodValidationPipe(updateUserSchema))
    userUpdatePayload: updateUserDTO,
  ) {
    return this.userService.update(id, userUpdatePayload);
  }

  @Delete(':id')
  async delete(@Param('id') id: bigint) {
    const removedUser = await this.userService.delete(id);
    return Boolean(removedUser);
  }
}
