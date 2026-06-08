import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { UserEntity } from '../../database/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>, private jwtService: JwtService) {}

  private hashPassword(password: string, salt: string) { return createHash('sha256').update(`${password}:${salt}`).digest('hex'); }

  async register(dto: RegisterDto) {
    if (await this.userRepo.findOne({ where: { email: dto.email } })) throw new ConflictException('Email already registered');
    const salt = randomBytes(16).toString('hex');
    const user = this.userRepo.create({ name: dto.name, email: dto.email, password: `${salt}:${this.hashPassword(dto.password, salt)}`, role: dto.role });
    await this.userRepo.save(user);
    const { password: _, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, isActive: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const [salt, storedHash] = user.password.split(':');
    const inputHash = this.hashPassword(dto.password, salt);
    if (!timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(inputHash, 'hex'))) throw new UnauthorizedException('Invalid credentials');
    return { accessToken: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }), user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
