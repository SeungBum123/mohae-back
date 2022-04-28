import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/repository/user.repository';
import { Letter } from 'src/letters/entity/letter.entity';
import { LetterRepository } from 'src/letters/repository/letter.repository';
import { ErrorConfirm } from 'src/utils/error';
import {
  MailboxRepository,
  MailboxUserRepository,
} from './repository/mailbox.repository';

@Injectable()
export class MailboxesService {
  constructor(
    @InjectRepository(MailboxRepository)
    private mailboxRepository: MailboxRepository,

    @InjectRepository(UserRepository)
    private userRepository: UserRepository,

    @InjectRepository(LetterRepository)
    private letterRepository: LetterRepository,

    @InjectRepository(MailboxUserRepository)
    private mailboxUserRepository: MailboxUserRepository,

    private errorConfirm: ErrorConfirm,
  ) {}

  async findAllMailboxes(loginUserNo: number) {
    try {
      const Letters = this.letterRepository
        .createQueryBuilder()
        .subQuery()
        .select([
          'letter.no AS no',
          'letter.mailbox AS mailbox',
          'letter.description AS description',
          'letter.createdAt AS createdAt',
        ])
        .from(Letter, 'letter')
        .groupBy('letter.no')
        .limit(1)
        .orderBy('letter.createdAt', 'DESC')
        .getQuery();

      const mailbox = await this.userRepository
        .createQueryBuilder('user')
        .where('user.no = :loginUserNo', { loginUserNo })
        .leftJoin('user.mailboxes', 'mailbox')
        .leftJoin(Letters, 'letter', 'letter.mailbox = mailbox.no')
        .select([
          'user.no AS userNo',
          'user.photo_url AS photoUrl',
          'user.nickname AS nickname',
          'mailbox.no AS mailboxNo',
          'letter.no AS letterNo',
          'letter.description AS letterDescription',
          'letter.createdAt AS letterCreatedAt',
        ])
        .orderBy('letter.createdAt', 'DESC')
        .getRawMany();

      return mailbox;
    } catch (e) {
      throw e;
    }
  }

  async searchMailbox(mailboxNo: number, limit: number) {
    try {
      const mailbox = await this.mailboxRepository.searchMailbox(
        mailboxNo,
        limit,
      );

      const notReadLetter = await this.letterRepository.notReadingLetter(
        mailboxNo,
      );
      this.errorConfirm.notFoundError(
        notReadLetter,
        '경로를 찾을 수 없습니다.',
      );

      for (const letter of notReadLetter) {
        await this.letterRepository.updateReading(letter.no);
      }
      return mailbox;
    } catch (e) {
      throw e;
    }
  }

  async checkMailbox(oneselfNo: number, opponentNo: number) {
    try {
      // const mailbox = await this.mailboxRepository.checkMailbox(
      //   oneselfNo,
      //   opponentNo,
      // );
      console.log(oneselfNo, opponentNo);
      const mailbox = await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.mailboxUsers', 'mailboxUser')
        .leftJoinAndSelect('mailboxUser.user', 'user')
        .leftJoinAndSelect('mailboxUser.mailbox', 'mailbox')
        // .select('users.no')
        .select([
          'users.no',
          'users.nickname',
          'mailboxUser.no',
          'mailbox.no',
          'user.no',
        ])
        // .where('users.no = :oneselfNo', { oneselfNo })
        // .where('users.no = :oneselfNo AND MUUser.no = :opponentNo', {
        //   oneselfNo,
        //   opponentNo,
        // })
        .getMany();
      console.log(mailbox);
      // 1,2 조회는 되는데 2,1 조회랑 다른 게 안됨;;;;; 사ㅣ 발라비ㅏㅣㅏㅅ
      return mailbox;
    } catch (e) {
      throw e;
    }
  }
}
