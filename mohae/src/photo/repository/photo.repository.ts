import { InternalServerErrorException } from '@nestjs/common';
import { CreateBoardDto } from 'src/boards/dto/board.dto';
import { Board } from 'src/boards/entity/board.entity';
import { Spec } from 'src/specs/entity/spec.entity';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { BoardPhoto } from '../entity/board.photo.entity';
import { SpecPhoto } from '../entity/photo.entity';

@EntityRepository(SpecPhoto)
export class SpecPhotoRepository extends Repository<SpecPhoto> {
  async saveSpecPhoto(specPhotoArr: Array<object>): Promise<Array<object>> {
    try {
      const result: InsertResult = await this.createQueryBuilder('specPhoto')
        .insert()
        .into(SpecPhoto)
        .values(specPhotoArr)
        .execute();

      return result.identifiers;
    } catch (err) {
      throw new InternalServerErrorException(
        `스펙 사진 저장도중 에러가 발생 하였습니다.${err}`,
      );
    }
  }

  async deleteBeforePhoto(specPhotos: Array<SpecPhoto>): Promise<void> {
    try {
      await this.createQueryBuilder('specPhoto')
        .delete()
        .from(SpecPhoto)
        .where(specPhotos)
        .execute();
    } catch (err) {
      throw err;
    }
  }

  async getSpecNo(no: number): Promise<number> {
    try {
      const { spec }: any = await this.createQueryBuilder('specPhoto')
        .leftJoinAndSelect('specPhoto.spec', 'spec')
        .select(['specPhoto.no', 'spec.no'])
        .where('specPhoto.no = :no', { no })
        .getOne();

      return spec.no;
    } catch (err) {
      throw new InternalServerErrorException(
        `스펙 번호 가져오기 도중 오류가 발생 하였습니다.${err}`,
      );
    }
  }
}

@EntityRepository(BoardPhoto)
export class BoardPhotoRepository extends Repository<BoardPhoto> {
  async createPhoto(photo_url, board_no): Promise<number> {
    try {
      const { raw } = await this.createQueryBuilder('boardPhotos')
        .insert()
        .into(BoardPhoto)
        .values([{ photo_url, board: board_no }])
        .execute();

      return raw.insertId;
    } catch (err) {
      throw new InternalServerErrorException(
        `게시글 사진 저장도중 에러가 발생하였습니다. ${err}`,
      );
    }
  }

  async updatePhoto(
    no: number,
    photo_url: string,
    sequence_no: number,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(BoardPhoto)
        .set({ photo_url })
        .where('board_no = :no', { no })
        .andWhere('sequence_no = :no', { no: sequence_no })
        .execute();

      return affected;
    } catch (err) {
      throw err;
    }
  }

  async deletePhoto(no: number) {
    try {
      await this.createQueryBuilder('boardPhotos')
        .delete()
        .from(BoardPhoto)
        .where('board_no = :no', { no })
        .execute();
    } catch (err) {
      throw new InternalServerErrorException(
        `게시글 사진 지우는 로직 에러 발생 ${err}`,
      );
    }
  }
}
