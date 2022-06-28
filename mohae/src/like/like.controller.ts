import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { HTTP_STATUS_CODE } from 'src/common/configs/http-status.config';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { operationConfig } from 'src/common/swagger-apis/api-operation.swagger';
import { apiResponse } from 'src/common/swagger-apis/api-response.swagger';
import { LikeBoardDto } from './dto/board-like.dto';
import { LikeUserDto } from './dto/user-like.dto';
import { LikeService } from './like.service';

@Controller('like')
@ApiTags('like')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @ApiOperation({
    summary: '회원간 좋아요 API',
    description: '회원간에 좋아요를 누를 때 사용되는 api',
  })
  @ApiOkResponse({
    description: '성공적으로 좋아요가 눌린 경우.',
    schema: {
      example: {
        statusCode: 201,
        msg: '성공적으로 요청이 처리되었습니다.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '좋아요 누르려는 프로필 주인이 존재하지 않는 회원이였을 경우',
    schema: {
      example: {
        statusCode: 404,
        msg: '~번의 유저는 존재하지 않는 유저 입니다.',
        err: 'Not Found',
      },
    },
  })
  @ApiConflictResponse({
    description: '좋아요 혹은 좋아요 취소를 중복으로 요청한 경우',
    schema: {
      example: {
        statusCode: 409,
        msg: '좋아요(좋아요 취소)를 중복해서 요청할 수 없습니다 (좋아요 (취소)는 judge true(false)로 넣어주세요)',
        err: 'Conflict',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '요청에 대한 응답 처리중 서버에러가 발생한 경우',
    schema: {
      example: {
        statusCode: 500,
        msg: 'DB관련한 에러 메시지 + ~에서 일어난 에러입니다.',
        err: 'InternalServerErrorException',
      },
    },
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HTTP_STATUS_CODE.success.created)
  @Post('/user')
  async likeUser(@Body() likeUserDto: LikeUserDto, @CurrentUser() user: User) {
    try {
      await this.likeService.likeUser(user, likeUserDto);

      return Object.assign({
        success: true,
        msg: '성공적으로 요청이 처리되었습니다.',
      });
    } catch (err) {
      throw err;
    }
  }

  @ApiOperation(operationConfig('게시글 좋아요 경로', '게시글 좋아요 API'))
  @ApiOkResponse(
    apiResponse.success(
      '성공여부',
      HTTP_STATUS_CODE.success.ok,
      '성공적으로 요청이 처리되었습니다.',
    ),
  )
  @ApiUnauthorizedResponse(
    apiResponse.error(
      '가입한 회원이 아닌 경우',
      HTTP_STATUS_CODE.clientError.unauthorized,
      'Unauthorized',
      'Unauthorized',
    ),
  )
  @ApiConflictResponse(
    apiResponse.error(
      '좋아요를 중복해서 눌렀거나, 좋아요 취소를 중복해서 눌렀을 때',
      HTTP_STATUS_CODE.clientError.conflict,
      '좋아요를 중복해서 요청할 수 없습니다 (좋아요 취소는 judge false로 넣어주세요)',
      'Confilct',
    ),
  )
  @ApiNotFoundResponse(
    apiResponse.error(
      '존재하지 않는 게시글의 좋아요 요청을 보냈을 때',
      HTTP_STATUS_CODE.clientError.notFound,
      '115번의 게시글은 존재하지 않는 게시글 입니다',
      'Not Found',
    ),
  )
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @HttpCode(HTTP_STATUS_CODE.success.ok)
  @Post('/board/:boardNo')
  async likeBoard(
    @Param('boardNo') boardNo: number,
    @Body() likeBoardDto: LikeBoardDto,
    @CurrentUser() user: User,
  ) {
    await this.likeService.likeBoard(user.no, boardNo, likeBoardDto);

    return {
      msg: '성공적으로 요청이 처리되었습니다.',
    };
  }
}
