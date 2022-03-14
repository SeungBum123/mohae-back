import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entity/review.entity';
import { ReviewRepository } from './repository/review.repository';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async findAll() {
    return await this.reviewRepository.find();
  }

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    return await this.reviewRepository.createReview(createReviewDto);
  }
}
