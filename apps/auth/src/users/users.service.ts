import { NOTIFICATIONS_SERVICE, UserRole } from '@app/common';
import { User } from '@app/common/entities';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, GetUserDto, ResetPasswordDto, UpdateUserDto } from './dto';
import { UsersRepository } from './users.repository';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  protected readonly logger = new Logger(UsersService.name);
  
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {

  }

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists.');
  }


  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);
    const { password, ...payload } = createUserDto;
    const user = new User(payload);
    user.activationToken = this.jwtService.sign({ email: user.email });
    user.setPassword(createUserDto.password);
    await this.usersRepository.create(user);
    this.notificationsService.emit('send_email', {
      to: user.email,
      subject: 'Activate Account',
      body: `<a href="${this.configService.get('FRONTEND_URL')}/activate/${user.activationToken}">Click here to activate your account</a>`,
    });
    return user.toJson()
  }

  async activate(activationToken: string) {
    const email = this.jwtService.verify(activationToken).email;
    const user = await this.usersRepository.findOne({ email });
    user.isActivated = true;
    await this.usersRepository.findOneAndUpdate({ id: user.id }, {
      isActivated: true,
      activationToken: null,
    });
    return true;
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findOne({ email });
    user.passwordResetToken = this.jwtService.sign({ email: user.email });
    await this.usersRepository.findOneAndUpdate({ id: user.id }, {
      passwordResetToken: user.passwordResetToken,
    });
    this.notificationsService.emit('send_email', {
      to: user.email,
      subject: 'Password Reset',
      body: `<a href="${this.configService.get('FRONTEND_URL')}/reset-password/${user.passwordResetToken}}">Click here to reset your password</a>`,
    });
    return true;
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const email = this.jwtService.verify(token).email;
    const user = await this.usersRepository.findOne({ email });
    user.setPassword(password);
    user.passwordResetToken = null;
    await this.usersRepository._save(user);

    this.notificationsService.emit('send_email', {
      to: user.email,
      subject: 'Password Reset Successful',
      body: 'Your password has been reset successfully',
    });

    return true;
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    if (!user.authenticate(password)) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }

  async createAdminUser() {
    const repo = this.dataSource.getRepository(User);
    const admin = await repo.findOne({ where: { email: 'admin' } });
    if (!admin) {
      const user = new User({
        email: 'admin',
        name: 'Admin',
        role: UserRole.ADMIN,
        isActivated: true,
      });
      user.setPassword('admin');
      await repo.save(user);
    }
    this.logger.log('Admin user created');
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.findOneAndUpdate({ id }, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
