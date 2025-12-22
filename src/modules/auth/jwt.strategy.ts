import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        language: true, // لجلب لغة المستخدم
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

    if (!user) throw new UnauthorizedException('User not found');

    const userLangCode = user.language?.code;

    // ---------------- Roles with translated names ----------------
    const roles = await Promise.all(
      user.userRoles.map(async (ur) => {
        const translations = await this.prisma.rolePermissionTranslation.findMany({
          where: { tableName: 'Role', rowId: ur.role.id },
          include: { Language: true },
        });

        let roleName = '';
        if (userLangCode) {
          const langTranslation = translations.find((t) => t.Language.code === userLangCode);
          if (langTranslation) roleName = langTranslation.content;
        }
        if (!roleName && translations.length > 0) {
          roleName = translations[0].content;
        }

        return {
          id: ur.role.id,
          name: roleName,
        };
      }),
    );

    // ---------------- Permissions with translated names ----------------
    const permissionsMap = new Map<number, { id: number; name: string; endpoint: string }>();

    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        const perm = rp.permission;
        if (permissionsMap.has(perm.id)) continue;

        const translations = await this.prisma.dynamicTranslation.findMany({
          where: { tableName: 'Permission', rowId: perm.id },
          include: { Language: true },
        });

        let name = '';
        if (userLangCode) {
          const langTranslation = translations.find((t) => t.Language.code === userLangCode);
          if (langTranslation) name = langTranslation.content;
        }
        if (!name && translations.length > 0) {
          name = translations[0].content;
        }

        permissionsMap.set(perm.id, {
          id: perm.id,
          name,
          endpoint: perm.endpoint,
        });
      }
    }

    const permissions = Array.from(permissionsMap.values());

    return {
      id: user.id,
      email: user.email,
      roles,
      permissions,
    };
  }
}
