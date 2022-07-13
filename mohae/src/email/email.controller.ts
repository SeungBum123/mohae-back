import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/auth/entity/user.entity';
import { AwsService } from 'src/aws/aws.service';
import { HTTP_STATUS_CODE } from 'src/common/configs/http-status.config';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SendEmailDto } from './dto/email.dto';
import { QuestionEmailDto } from './dto/question.email.dto';
import { EmailService } from './email.service';

@Controller('email')
@ApiTags('Email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly awsService: AwsService,
  ) {}

  @HttpCode(HTTP_STATUS_CODE.success.ok)
  @Post('/forget/password')
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<object> {
    const a = await this.emailService.sendEmail(sendEmailDto);
    console.log(a);
    return {
      msg: `해당 이메일(${sendEmailDto.email})로 비밀번호 변경 링크가 전송되었습니다.`,
    };
  }

  @Post('/question')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @UseInterceptors(FilesInterceptor('image'))
  async questionEmail(
    @Body()
    questionEmailDto: QuestionEmailDto,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<object> {
    const questionPhotoUrls: string[] =
      await this.awsService.uploadQuestionFileToS3('question', files);

    await this.emailService.questionEmail(
      user,
      questionEmailDto,
      questionPhotoUrls,
    );

    return {
      msg: `${user.nickname}님의 문의사항이 성공적으로 전송 되었습니다.`,
    };
  }
}
