import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { UserRepository } from 'src/auth/repository/user.repository';
import { SpecPhotoRepository } from 'src/photo/repository/photo.repository';
import { ErrorConfirm } from 'src/common/utils/error';
import { CreateSpecDto, UpdateSpecDto } from './dto/spec.dto';
import { Spec } from './entity/spec.entity';
import { SpecRepository } from './repository/spec.repository';
import { Connection } from 'typeorm';
import { SpecPhoto } from 'src/photo/entity/photo.entity';

@Injectable()
export class SpecsService {
  constructor(
    @InjectRepository(SpecRepository)
    private specRepository: SpecRepository,

    @InjectRepository(UserRepository)
    private userRepository: UserRepository,

    @InjectRepository(SpecPhotoRepository)
    private specPhotoRepository: SpecPhotoRepository,

    private connection: Connection,
    private errorConfirm: ErrorConfirm,
  ) {}
  async getAllSpec(profileUserNo: number): Promise<any> {
    try {
      const specs: Array<Spec> = await this.specRepository.getAllSpec(
        profileUserNo,
      );

      if (!specs.length) {
        return '현재 등록된 스펙이 없습니다.';
      }
      return specs;
    } catch (err) {
      throw err;
    }
  }

  async getOneSpec(specNo: number): Promise<Spec> {
    try {
      const spec: Spec = await this.specRepository.getOneSpec(specNo);
      this.errorConfirm.notFoundError(spec, '해당 스펙이 존재하지 않습니다.');
      return spec;
    } catch (err) {
      throw err;
    }
  }

  async registSpec(
    userNo: number,
    specPhotoUrls: any,
    createSpecDto: CreateSpecDto,
  ): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user: User = await this.userRepository.findOne(userNo, {
        relations: ['specs'],
      });

      const specNo: Spec = await queryRunner.manager
        .getCustomRepository(SpecRepository)
        .registSpec(createSpecDto, user);
      if (!userNo) {
        throw new UnauthorizedException(
          `${userNo}에 해당하는 유저가 존재하지 않습니다.`,
        );
      }
      if (!specPhotoUrls.length) {
        throw new BadRequestException(
          '스펙의 사진이 없다면 null 이라도 넣어주셔야 스펙 등록이 가능합니다.',
        );
      }
      if (specPhotoUrls) {
        const specPhotos: Array<object> = specPhotoUrls.map(
          (photoUrl: string, index: number) => {
            return {
              photo_url: photoUrl,
              spec: specNo,
              order: index + 1,
            };
          },
        );
        const savedSpecPhotos: Array<object> = await queryRunner.manager
          .getCustomRepository(SpecPhotoRepository)
          .saveSpecPhoto(specPhotos);

        if (specPhotos.length !== savedSpecPhotos.length) {
          throw new InternalServerErrorException(
            '스펙 사진 등록 도중 DB관련 오류',
          );
        }

        await queryRunner.manager
          .getCustomRepository(SpecRepository)
          .addSpecPhoto(specNo, savedSpecPhotos);

        if (specNo) {
          await queryRunner.manager
            .getCustomRepository(UserRepository)
            .userRelation(userNo, specNo, 'specs');
        }
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateSpec(
    specNo: number,
    updateSpecDto: UpdateSpecDto,
    specPhotoUrls: false | string[],
  ): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const spec: Spec = await this.specRepository.getOneSpec(specNo);

      this.errorConfirm.notFoundError(spec, '해당 스펙이 존재하지 않습니다.');

      await queryRunner.manager
        .getCustomRepository(SpecRepository)
        .updateSpec(specNo, updateSpecDto);

      if (specPhotoUrls) {
        const { specPhotos }: Spec = await this.specRepository.findOne(specNo, {
          select: ['no', 'specPhotos'],
          relations: ['specPhotos'],
        });

        await queryRunner.manager
          .getCustomRepository(SpecPhotoRepository)
          .deleteBeforePhoto(specPhotos);
        const newSpecPhotos: Array<object> = specPhotoUrls.map((photo) => {
          return {
            photo_url: photo,
            spec: specNo,
            order: specPhotoUrls.indexOf(photo) + 1,
          };
        });
        await queryRunner.manager
          .getCustomRepository(SpecPhotoRepository)
          .saveSpecPhoto(newSpecPhotos);

        const originSpecPhotosUrl = specPhotos.map((specPhoto) => {
          return specPhoto.photo_url;
        });
        await queryRunner.commitTransaction();
        return originSpecPhotosUrl;
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteSpec(specNo: number): Promise<number> {
    try {
      const isDelete: number = await this.specRepository.deleteSpec(specNo);

      if (!isDelete) {
        throw new InternalServerErrorException(
          '스팩 삭제가 제대로 이루어지지 않았습니다.',
        );
      }
      return isDelete;
    } catch (err) {
      throw err;
    }
  }

  async readUserSpec(
    userNo: number,
    take: number,
    page: number,
  ): Promise<Array<Spec>> {
    try {
      const profileSpecs: Array<Spec> = await this.specRepository.readUserSpec(
        userNo,
        take,
        page,
      );
      return profileSpecs;
    } catch (err) {
      throw err;
    }
  }
}
