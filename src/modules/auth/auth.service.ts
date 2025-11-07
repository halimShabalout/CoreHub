import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthLoginDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Extract roles
    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
    }));

    // Extract permissions (unique)
    const permissions: {
      id: number;
      name: string;
      endpoint: string;
    }[] = [];

    user.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        const perm = rp.permission;

        if (!permissions.some((p) => p.id === perm.id)) {
          permissions.push({
            id: perm.id,
            name: perm.name,
            endpoint: perm.endpoint,
          });
        }
      });
    });


    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      roles,
      language: user.language
        ? {
          id: user.language.id,
          code: user.language.code,
          name: user.language.name,
        }
        : null,
      permissions,
    };
  }
}
