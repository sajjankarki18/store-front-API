"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const category_entity_1 = require("./entities/category.entity");
const Category_repository_1 = require("./repositories/Category.repository");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
        this.validateCategoryUpdation = async (categoryDto) => {
            if (categoryDto.parent_id) {
                const childCategory = await this.categoryRepository.findOne({
                    where: {
                        id: categoryDto.parent_id,
                    },
                });
                if (!childCategory) {
                    throw new common_1.NotFoundException({
                        statusCode: common_1.HttpStatus.NOT_FOUND,
                        message: ['category not found!'],
                        error: 'Not Found',
                    });
                }
                const parentCategory = await this.categoryRepository.findOne({
                    where: {
                        id: childCategory.parent_id,
                    },
                });
                if (parentCategory && parentCategory.parent_id) {
                    const grandParentCategory = await this.categoryRepository.findOne({
                        where: {
                            id: parentCategory.parent_id,
                        },
                    });
                    if (grandParentCategory) {
                        throw new common_1.ConflictException({
                            statusCode: common_1.HttpStatus.CONFLICT,
                            message: ['category could not be updated more than 3 levels'],
                            error: ['Conflict'],
                        });
                    }
                }
            }
        };
    }
    async createCategory(categoryDto) {
        try {
            const category = this.categoryRepository.create({
                title: categoryDto.title,
                description: categoryDto.description,
                parent_id: categoryDto.parent_id,
            });
            return await this.categoryRepository.save(category);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: ['some error occured while creating the category', error],
                error: 'Internal server error',
            });
        }
    }
    async fetchAllCategories({ page, limit, }) {
        if (isNaN(Number(page)) || isNaN(Number(limit)) || page < 0 || limit < 0) {
            throw new common_1.BadRequestException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: ['page and limits must be of positive integers'],
                error: 'Bad request',
            });
        }
        const new_limit = limit > 10 ? 10 : limit;
        const [data, total] = await this.categoryRepository.findAndCount({
            skip: (page - 1) * new_limit,
            take: new_limit,
            order: { created_at: 'desc' },
        });
        return {
            data,
            page,
            limit: new_limit,
            total,
        };
    }
    async fetchCategoryById(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: ['category not found!'],
                error: 'Not Found',
            });
        }
        return category;
    }
    async updateCategory(id, categoryDto) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: ['category not found!'],
                error: 'Not Found',
            });
        }
        await this.validateCategoryUpdation(categoryDto);
        try {
            await this.categoryRepository.update({ id }, {
                title: categoryDto.title,
                description: categoryDto.description,
                parent_id: categoryDto.parent_id,
                image_url: categoryDto.image_url,
            });
            return await this.categoryRepository.findOne({ where: { id } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: ['some error occured while creating the category', error],
                error: 'Internal server error',
            });
        }
    }
    async deleteCategory(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: ['category not found!'],
                error: 'Not Found',
            });
        }
        if (category.parent_id === null) {
            const child_categories = await this.categoryRepository.find({
                where: {
                    parent_id: id,
                },
            });
            if (child_categories.length > 0) {
                throw new common_1.ConflictException({
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: [
                        'category could not be deleted, it has existing child categories',
                    ],
                    error: 'Conflict',
                });
            }
        }
        else if (category.parent_id !== null) {
            const grandChild_categories = await this.categoryRepository.find({
                where: {
                    parent_id: id,
                },
            });
            if (grandChild_categories.length > 0) {
                throw new common_1.ConflictException({
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: [
                        'category could not be deleted, it has existing child categories',
                    ],
                    error: 'Conflict',
                });
            }
        }
        await this.categoryRepository.softDelete(id);
        return {
            id: `${id}`,
            message: 'category has been deleted',
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [Category_repository_1.CategoryRepository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map