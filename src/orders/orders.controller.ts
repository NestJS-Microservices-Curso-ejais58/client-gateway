import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseUUIDPipe, Query } from '@nestjs/common';


import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { firstValueFrom } from 'rxjs';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusDto } from './dto/status.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    const pattern = 'createOrder';
    return this.client.send(pattern, createOrderDto);
  }

  @Get()
  async findAllOrders(@Query() orderPaginationDto: OrderPaginationDto) {
    try {
      const pattern = 'findAllOrders';
      const orders = await firstValueFrom(
        this.client.send(pattern, orderPaginationDto)
      );
      return orders
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Get('id/:id')
  async findOneOrder(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const pattern = 'findOneOrder';
      const order = await firstValueFrom(
        this.client.send(pattern, {id})
      );

      return order;
    } catch (error) {
      throw new RpcException(error)
    }
    
  }

  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      const pattern = 'findAllOrders';
      return this.client.send(pattern, {
        ...paginationDto,
        status: statusDto.status
      });

    } catch (error) {
      throw new RpcException(error)
    }
    
  }

  @Patch(':id')
  async changeOrderStatus(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() statusDto: StatusDto
  ) {
    try {
      const pattern = 'changeOrderStatus';
      return await firstValueFrom(this.client.send(pattern, {id, status: statusDto.status}))
    } catch (error) {
      throw new RpcException(error)
    }
  }

}
