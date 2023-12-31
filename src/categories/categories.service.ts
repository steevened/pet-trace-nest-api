import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  private convertToSlug(string: string): string {
    let slug = string.trim().toLowerCase();

    slug = slug.replace(/ /g, '-');
    slug = slug.replace(/[^a-zA-Z0-9-]/g, '');
    return slug;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { name } = createCategoryDto;
      const slug = this.convertToSlug(name);

      const category = this.categoriesRepository.create({
        ...createCategoryDto,
        slug,
      });
      await this.categoriesRepository.save(category);
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.categoriesRepository.find();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoriesRepository.findOneBy({ id });
      if (!category)
        throw new NotFoundException(`Category with id ${id} not found`);
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneBySlug(slug: string) {
    try {
      const category = await this.categoriesRepository.findOneBy({ slug });
      if (!category)
        throw new NotFoundException(`Category with slug ${slug} not found`);
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    let slug;
    if (updateCategoryDto.name) {
      slug = this.convertToSlug(updateCategoryDto.name);
    }
    const category = await this.categoriesRepository.preload({
      id,
      slug,
      ...updateCategoryDto,
    });
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);

    try {
      await this.categoriesRepository.save(category);
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    try {
      await this.categoriesRepository.delete(category);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
