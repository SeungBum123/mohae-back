import { User } from 'src/auth/entity/user.entity';
import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_like')
export class UserLike extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => User, (user) => user.no, {
    onDelete: 'SET NULL',
  })
  likedMe: User;

  @ManyToOne((type) => User, (user) => user.no, {
    onDelete: 'SET NULL',
  })
  likedUser: User;
}
