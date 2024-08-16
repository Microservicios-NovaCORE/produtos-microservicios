import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaClient } from '@prisma/client';
import { PaginacionDto } from 'src/common';

@Injectable()
export class ProductosService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductosService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductoDto: CreateProductoDto) {

    return this.producto.create({
      data: createProductoDto
    })
    // return 'This action adds a new producto';
  }

  async findAll(PaginacionDto: PaginacionDto) {
    const { page, limit } = PaginacionDto;
    const totalpaginas = await this.producto.count({ where: { available: true } });
    const lastpagina = Math.ceil(totalpaginas / limit);


    return {
      data: await this.producto.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true
        }
      }),
      meta: {
        total: totalpaginas,
        page: page,
        lastpagina: lastpagina
      }
    }
  }

  async findOne(id: number) {
    const producto = await this.producto.findFirst({
      where: { id, available: true }
    });


    if (!producto) {
      throw new NotFoundException(`El Producto con id #${id} not found`);
    }

    return producto;

  }


  async update(id: number, updateProductDto: UpdateProductoDto) {

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    return this.producto.update({
      where: { id },
      data: data,
    });


  }

  async remove(id: number) {

    await this.findOne(id);

    // return this.producto.delete({
    //   where: { id }
    // });

    const Producto = await this.producto.update({
      where: { id },
      data: {
        available: false
      }
    });

    return Producto;


  }
}
