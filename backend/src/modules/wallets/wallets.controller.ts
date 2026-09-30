import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletsService } from './wallets.service';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return this.walletsService.getBalance(req.user.id);
  }

  @Post('transfer')
  async transfer(@Request() req, @Body() body: { receiverEmail: string; amount: number }) {
    return this.walletsService.transferP2P(req.user.id, body.receiverEmail, body.amount);
  }

  @Get('history')
  async getHistory(@Request() req) {
    return this.walletsService.getHistory(req.user.id);
  }
}
