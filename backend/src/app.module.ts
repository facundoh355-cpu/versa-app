import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { WalletsModule } from './modules/wallets/wallets.module';

@Module({
  imports: [AuthModule, WalletsModule],
})
export class AppModule {}
