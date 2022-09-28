import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';

import { MenusService } from './menus.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';

@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Post()
  create(@Body() body: CreateMenuDto) {
    return this.menusService.create(body);
  }

  @Get('/:id')
  getSingle(@Param('id') id: string) {
    return this.menusService.getSingle(id);
  }

  @Put('/:id')
  updateMenu(@Param('id') id: string, @Body() body: UpdateMenuDto) {
    return this.menusService.update(id, body);
  }

  @Get('/company/:compId')
  getCompanyMenus(@Param('compId') compId: string) {
    return this.menusService.getCompanyMenus(compId);
  }
}
