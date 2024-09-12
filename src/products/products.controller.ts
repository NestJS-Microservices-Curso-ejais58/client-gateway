import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NATS_SERVICE } from 'src/config/services';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto){
    const pattern = {cmd: 'create_product'};
    return this.client.send(pattern, createProductDto);
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto){
    const pattern = {cmd: 'find_all_products'}
    return this.client.send(pattern, paginationDto);
  }

  @Get(':id')
  async findOneProduct(@Param('id') id: string){
    try {
      const pattern = {cmd: 'find_one_product'}
      
      const product = await firstValueFrom(
        this.client.send(pattern, {id})
      );

      return product;

    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto){
    // const pattern = {cmd: 'update_product'};
    // return this.productsClient.send(pattern, {id, ...updateProductDto}).pipe(
    //   catchError(err => {throw new RpcException(err)})
    // );

    try {
      const pattern = {cmd: 'update_product'}
      
      const product = await firstValueFrom(
        this.client.send(pattern, {id, ...updateProductDto})
      );

      return product;

    } catch (error) {
      throw new RpcException(error);
    }
   
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string){
    try {
      const pattern = {cmd: 'delete_product'};
      const product = await firstValueFrom(
        this.client.send(pattern, {id})
      );

      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
