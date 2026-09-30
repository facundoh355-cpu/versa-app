import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; phoneNumber?: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        phoneNumber: data.phoneNumber,
        wallet: {
          create: {
            address: `0x${crypto.randomBytes(20).toString('hex')}`,
            balanceUSD: 100.00,
          },
        },
      },
      include: { wallet: true },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      wallet: user.wallet,
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }
}
