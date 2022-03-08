import { Controller, Get, Logger } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entity/category.entity';

@Controller('categories')
export class CategoriesController {
  private logger = new Logger('CategoriesController');
  constructor(private categoryService: CategoriesService) {}

  @Get()
  findAllCategories(): Promise<Category[]> {
    this.logger.verbose(`카테고리 전체 조회 시도`);
    return this.categoryService.findAllCategories();
  }
}
