import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { EmailService } from '../../services/email.service';

// Estrategias de autenticación
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    // Only include OAuth strategies if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleStrategy] : []),
    ...(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET ? [FacebookStrategy] : []),
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}