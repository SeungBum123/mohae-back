import { UserRepository } from 'src/auth/repository/user.repository';
import { ErrorConfirm } from 'src/common/utils/error';
import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuestionEmailDto } from './dto/question.email.dto';
import { CHANGE_EMAIL } from './htmls/change-email.html';
import { questionHtml } from './htmls/question-email';
import { SendEmailDto } from './dto/email.dto';
interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  attachments?: any;
}
@Injectable()
export class EmailService {
  private transpoter: Mail;
  constructor(
    private errorConfirm: ErrorConfirm,
    private userRepository: UserRepository,
    private configService: ConfigService,
  ) {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<string>('EMAIL_PORT');
    const emailAuthEmail = this.configService.get<string>('EMAIL_AUTH_EMAIL');
    const emailAuthPassword = this.configService.get<string>(
      'EMAIL_AUTH_PASSWORD',
    );

    this.transpoter = nodemailer.createTransport({
      host: emailHost,
      secure: false,
      auth: {
        user: emailAuthEmail,
        pass: emailAuthPassword,
      },
    });
  }
  async sendEmail(sendEmailDto: SendEmailDto): Promise<object> {
    try {
      const emailFromUserName =
        this.configService.get<string>('EMAIL_AUTH_EMAIL');
      const { name, email }: SendEmailDto = sendEmailDto;
      const user = await this.userRepository.signIn(email);
      const url = '비밀번호 변경 url 적어주면 됨 ㅋ';
      this.errorConfirm.notFoundError(
        user,
        '해당 email을 가진 유저는 없습니다.',
      );
      if (user.name === name) {
        const mailOptions: EmailOptions = {
          to: email,
          from: emailFromUserName,
          subject: `모해로부터 온 ${name}님의 비밀번호 변경 관련 메일입니다.`,
          html: CHANGE_EMAIL,
        };

        return await this.transpoter.sendMail(mailOptions);
      }
      throw new UnauthorizedException(
        '등록하셨던 이름과 현재 이름이 맞지 않습니다.',
      );
    } catch (err) {
      throw err;
    }
  }

  async questionEmail(
    { nickname, email }: any,
    questionEmailDto: QuestionEmailDto,
    questionPhotoUrls: Array<string>,
  ): Promise<object> {
    try {
      const { title, description }: QuestionEmailDto = questionEmailDto;
      const emailFromUserName: string =
        this.configService.get<string>('EMAIL_AUTH_EMAIL');

      const urlLists: Array<object> = questionPhotoUrls.map((el) => {
        const obj = {};
        obj['path'] = encodeURI(el);
        return obj;
      });

      const mailOptions: EmailOptions = {
        to: emailFromUserName,
        from: emailFromUserName,
        subject: `#모해 문의 접수 : ${nickname}님`,
        html: questionHtml(email, title, description),
        attachments: urlLists,
      };

      return await this.transpoter.sendMail(mailOptions);
    } catch (err) {
      throw err;
    }
  }
}
