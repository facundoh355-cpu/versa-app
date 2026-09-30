import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Billetera no encontrada');
    }

    return wallet;
  }

  async transferP2P(senderId: string, receiverEmail: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    const receiver = await this.prisma.user.findUnique({
      where: { email: receiverEmail },
      include: { wallet: true },
    });

    if (!receiver || !receiver.wallet) {
      throw new NotFoundException('El receptor no existe');
    }

    if (receiver.id === senderId) {
      throw new BadRequestException('No puedes transferirte a ti mismo');
    }

    return this.prisma.$transaction(async (tx) => {
      const senderWallet = await tx.wallet.findUnique({ where: { userId: senderId } });

      if (!senderWallet || Number(senderWallet.balanceUSD) < amount) {
        throw new BadRequestException('Saldo insuficiente');
      }

      await tx.wallet.update({
        where: { userId: senderId },
        data: {
          balanceUSD: {
            decrement: amount,
          },
        },
      });

      await tx.wallet.update({
        where: { userId: receiver.id },
        data: {
          balanceUSD: {
            increment: amount,
          },
        },
      });

      return tx.transaction.create({
        data: {
          senderId,
          receiverId: receiver.id,
          amount,
          fee: 0,
          type: 'P2P_TRANSFER',
          status: 'COMPLETED',
        },
      });
    });
  }

  async getHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { email: true } },
        receiver: { select: { email: true } },
      },
    });
  }
}
