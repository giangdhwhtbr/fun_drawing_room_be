import { UserRole } from '@app/common/constant';
import { AbstractEntity } from '@app/common/database/abstract.entity';
import { AfterLoad, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User extends AbstractEntity<User> {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ default: false })
  isActivated?: boolean;

  @Column({ nullable: true })
  activationToken?: string;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column()
  private password?: string;

  @Column({ default: UserRole.USER })
  role: number

  roles: string[]
  @AfterLoad()
  computeUserRoles(): void {
    const roles = []
    if (this.role & UserRole.USER) {
      roles.push(UserRole[UserRole.USER])
    }
    if (this.role & UserRole.ADMIN) {
      roles.push(UserRole[UserRole.ADMIN])
    }
    this.roles = roles
  }

  public setPassword(password: string): void {
    this.password = bcrypt.hashSync(password, 10);
  }

  authenticate(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }

  public toJson() {
    const { password, activationToken, passwordResetToken, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
