import { NOTIFICATIONS_SERVICE, UserRole } from '@app/common';
import { User } from '@app/common/entities';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateUserDto, ResetPasswordDto } from './dto';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UsersService {
  protected readonly logger = new Logger(UsersService.name);

  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {

  }

  async create(createUserDto: CreateUserDto) {
    const existed = await this.repository.findOne({ where: { email: createUserDto.email } });
    if (existed) {
      throw new UnprocessableEntityException('User already exists');
    }
    const { password, ...payload } = createUserDto;
    const user = new User(payload);
    user.activationToken = this.jwtService.sign({ email: user.email });
    user.setPassword(createUserDto.password);
    await this.repository.save(user);
    this.notificationsService.emit('send_email', {
      to: user.email,
      subject: 'Activate Account',
      body: `<a href="${this.configService.get('FRONTEND_URL')}/auth/activate?token=${user.activationToken}">Click here to activate your account</a>`,
    });
    return user.toJson()
  }

  async activate(activationToken: string) {
    const email = this.jwtService.verify(activationToken).email;
    const user = await this.repository.findOne({ where: { email } });
    user.isActivated = true;
    user.activationToken = null;
    await this.repository.save(user);
    return true;
  }

  async requestPasswordReset(email: string) {
    const user = await this.repository.findOne({ where: { email } });
    user.passwordResetToken = this.jwtService.sign({ email: user.email });
    await this.repository.save(user);
    this.notificationsService.emit('send_email', {
      to: user.email,
      subject: 'Password Reset',
      body: `<a href="${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${user.passwordResetToken}}">Click here to reset your password</a>`,
    });
    return true;
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const email = this.jwtService.verify(token).email;
    const user = await this.repository.findOne({ where: { email } });
    user.setPassword(password);
    user.passwordResetToken = null;
    await this.repository.save(user);
    this.notificationsService.emit('send_email', {
      to: user.email,
      subject: 'Password Reset Successful',
      body: 'Your password has been reset successfully',
    });

    return true;
  }

  async verifyUser(email: string, password: string) {
    const user = await this.repository.findOne({ where: { email } });

    if (!user.authenticate(password)) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    if (!user.isActivated) {
      throw new UnauthorizedException('Account is not activated.');
    }

    return user;
  }

  async createAdminUser() {
    const repo = this.dataSource.getRepository(User);
    const admin = await repo.findOne({ where: { email: this.configService.get('DEFAULT_ADMIN_EMAIL') } });
    if (!admin) {
      const user = new User({
        email: this.configService.get('DEFAULT_ADMIN_EMAIL'),
        name: 'Admin',
        role: UserRole.ADMIN,
        isActivated: true,
      });
      user.setPassword(this.configService.get('DEFAULT_ADMIN_PASSWORD'));
      await repo.save(user);
    }
    this.logger.log(`Admin user "${this.configService.get('DEFAULT_ADMIN_EMAIL')}" created`);
  }

  async findById(id: number) {
    return this.repository.findOneBy({ id });
  }

  async findAll(payload: FindUsersDto) {
    return this.repository.find(
      payload.ids ? { where: { id: In(payload.ids) } } : {},
    );
  }
}
