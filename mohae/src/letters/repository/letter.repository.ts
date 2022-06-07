import { InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/auth/entity/user.entity';
import { Mailbox } from 'src/mailboxes/entity/mailbox.entity';
import { EntityRepository, Repository, UpdateResult } from 'typeorm';
import { Letter } from '../entity/letter.entity';

@EntityRepository(Letter)
export class LetterRepository extends Repository<Letter> {
  async updateReading(mailboxNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Letter)
        .set({ reading_flag: true })
        .where('mailbox = :mailboxNo', { mailboxNo })
        .andWhere('reading_flag = false')
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async sendLetter(
    sender: User,
    receiver: User,
    mailbox: Mailbox,
    description?: string,
    imageUrl?: string,
  ) {
    try {
      const { raw } = await this.createQueryBuilder('letters')
        .insert()
        .into(Letter)
        .values([
          {
            sender,
            receiver,
            mailbox,
            description: description || imageUrl,
          },
        ])
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
