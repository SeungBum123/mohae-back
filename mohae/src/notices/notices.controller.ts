import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SuccesseInterceptor } from 'src/common/interceptors/success.interceptor';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dtd';
import { Notice } from './entity/notice.entity';
import { NoticesService } from './notices.service';

@UseInterceptors(SuccesseInterceptor)
@ApiTags('Notices')
@Controller('notices')
export class NoticesController {
  constructor(private noticesService: NoticesService) {}

  @ApiOperation({
    summary: '공지사항 전체 조회 기능',
    description: '공지사항을 전체 조회하는 API',
  })
  @HttpCode(200)
  @Get()
  async readAllNotices(): Promise<object> {
    const response: Notice | Notice[] =
      await this.noticesService.readAllNotices();

    return {
      msg: `Notice 전체 조회 완료`,
      response,
    };
  }

  @ApiOperation({
    summary: '공지사항 저장 기능',
    description: '공지사항을 저장하는 API',
  })
  @Role(true)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(201)
  @Post()
  async createNotice(
    @Body() createNoticeDto: CreateNoticeDto,
    @CurrentUser() manager: User,
  ): Promise<object> {
    await this.noticesService.createNotice(createNoticeDto, manager);

    return {
      msg: `Notice 생성 완료`,
    };
  }

  @ApiOperation({
    summary: '공지사항 수정 기능',
    description: '공지사항을 수정하는 API',
  })
  @Role(true)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(201)
  @Put('/:noticeNo')
  async updateNotice(
    @CurrentUser() manager: User,
    @Param('noticeNo') noticeNo: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
  ): Promise<object> {
    await this.noticesService.updateNotice(manager, noticeNo, updateNoticeDto);

    return {
      msg: `Notice 수정 완료`,
    };
  }

  @ApiOperation({
    summary: '공지사항 삭제 기능',
    description: '공지사항을 삭제하는 API',
  })
  @Role(true)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(201)
  @Delete('/:noticeNo')
  async deleteNotice(@Param('noticeNo') noticeNo: number): Promise<object> {
    await this.noticesService.deleteNotice(noticeNo);

    return {
      msg: '공지사항 삭제 완료',
    };
  }
}
