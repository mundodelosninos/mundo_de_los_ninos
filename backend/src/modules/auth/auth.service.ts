import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { User, UserRole, AuthProvider } from '../users/user.entity';
import { LoginDto, RegisterDto, SocialLoginDto } from './dto/auth.dto';
import { EmailService } from '../../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { email, password, firstName, lastName, role } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear nuevo usuario
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.PARENT,
      authProvider: AuthProvider.LOCAL,
    });

    await this.userRepository.save(user);

    const token = this.generateJwtToken(user);

    // Eliminar password del objeto retornado
    delete user.password;

    return { user, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateJwtToken(user);

    // Eliminar password del objeto retornado
    delete user.password;

    return { user, token };
  }

  async socialLogin(socialLoginDto: SocialLoginDto): Promise<{ user: User; token: string }> {
    const { email, firstName, lastName, provider, providerId } = socialLoginDto;

    let user = await this.userRepository.findOne({
      where: [
        { email },
        { googleId: provider === 'google' ? providerId : undefined },
        { facebookId: provider === 'facebook' ? providerId : undefined },
      ],
    });

    if (!user) {
      // Crear nuevo usuario con autenticación social
      user = this.userRepository.create({
        email,
        firstName,
        lastName,
        role: UserRole.PARENT,
        authProvider: provider === 'google' ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK,
        googleId: provider === 'google' ? providerId : undefined,
        facebookId: provider === 'facebook' ? providerId : undefined,
        emailVerified: true,
      });

      await this.userRepository.save(user);
    } else {
      // Actualizar información del proveedor si es necesario
      if (provider === 'google' && !user.googleId) {
        user.googleId = providerId;
      } else if (provider === 'facebook' && !user.facebookId) {
        user.facebookId = providerId;
      }
      
      await this.userRepository.save(user);
    }

    const token = this.generateJwtToken(user);

    return { user, token };
  }

  async validateUser(userId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['children', 'groups'],
    });
  }

  private generateJwtToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await this.validateUser(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    return this.generateJwtToken(user);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !(await user.validatePassword(oldPassword))) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false; // Limpiar el flag después de cambiar la contraseña
    await this.userRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateData: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.phone !== undefined) user.phone = updateData.phone;

    return await this.userRepository.save(user);
  }

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return { message: 'Si el email existe, recibirás un enlace de recuperación' };
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

    await this.userRepository.save(user);

    // Enviar email con el token de recuperación
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken,
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // En desarrollo, continuar aunque falle el envío
      if (process.env.NODE_ENV !== 'development') {
        throw new BadRequestException('Error al enviar el email de recuperación');
      }
    }

    // En desarrollo, devolver el token para pruebas
    const response: { message: string; token?: string } = {
      message: 'Si el email existe, recibirás un enlace de recuperación',
    };

    if (process.env.NODE_ENV === 'development') {
      response.token = resetToken;
    }

    return response;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);
  }
}