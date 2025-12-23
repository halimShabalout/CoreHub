import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthLoginDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) { }

  // ---------------- VALIDATE USER ----------------
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Email not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Password is incorrect');

    if (user.status === 'inactive') {
      throw new ForbiddenException(
        'Your account is inactive. Please contact the administrator.',
      );
    }

    return user;
  }

  // ---------------- LOGIN ----------------
  async login(data: AuthLoginDto) {
    const user = await this.validateUser(data.email, data.password);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      accessToken: token,
      userId: user.id,
    };
  }

  // ---------------- CURRENT USER ----------------
  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        language: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const userLangCode = user.language?.code;

    // Map userRoles with translated names
    const userRoles = await Promise.all(
      user.userRoles.map(async (ur) => {
        const translations = await this.prisma.rolePermissionTranslation.findMany({
          where: { tableName: 'Role', rowId: ur.role.id },
          include: { Language: true },
        });

        let roleName = '';
        if (userLangCode) {
          const langTranslation = translations.find(t => t.Language.code === userLangCode);
          if (langTranslation) roleName = langTranslation.content;
        }
        if (!roleName && translations.length > 0) {
          roleName = translations[0].content;
        }

        return {
          id: ur.id,
          userId: ur.userId,
          roleId: ur.roleId,
          createdAt: ur.createdAt,
          role: {
            id: ur.role.id,
            name: roleName,
            createdAt: ur.role.createdAt,
            updatedAt: ur.role.updatedAt,
          },
        };
      })
    );

    // Extract unique permissions with translated names
    const permissions: { id: number; name: string; endpoint: string }[] = [];

    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        const perm = rp.permission;

        if (permissions.some((p) => p.id === perm.id)) continue;

        const translations = await this.prisma.dynamicTranslation.findMany({
          where: { tableName: 'Permission', rowId: perm.id },
          include: { Language: true },
        });

        let name = '';
        if (userLangCode) {
          const langTranslation = translations.find(t => t.Language.code === userLangCode);
          if (langTranslation) name = langTranslation.content;
        }
        if (!name && translations.length > 0) {
          name = translations[0].content;
        }

        permissions.push({
          id: perm.id,
          name,
          endpoint: perm.endpoint,
        });
      }
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      language: user.language
        ? {
          id: user.language.id,
          code: user.language.code,
          name: user.language.name,
        }
        : null,
      userRoles,
      permissions,
    };
  }


  // ---------------- FORGOT PASSWORD ----------------
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
  <div style="font-family: 'Arial', sans-serif; background-color: #f5f7fa; padding: 40px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <tr>
        <td style="background: #4f46e5; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold;">
          CoreHub
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 30px; color: #333;">
          
          <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Reset Your Password</h2>

          <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
            We received a request to reset your password. Click the button below to create a new one.
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
              style="
                background-color: #4f46e5;
                color: white;
                padding: 14px 26px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
              ">
              Reset Password
            </a>
          </div>

          <!-- Alternative link -->
          <p style="font-size: 14px; color: #6b7280;">
            If the button doesn’t work, copy and paste this link into your browser:
          </p>

          <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
            <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
          </p>

          <p style="margin-top: 30px; font-size: 13px; color: #9ca3af;">
            This link is valid for 30 minutes.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
          © ${new Date().getFullYear()} CoreHub. All rights reserved.
        </td>
      </tr>

    </table>
  </div>
`;


    await this.mailerService.sendMail(user.email, 'Reset Password', html);

    return { message: 'Password reset link sent to your email!' };
  }

  // ---------------- RESET PASSWORD ----------------
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Password reset successful' };
  }
}
