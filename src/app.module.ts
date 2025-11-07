import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LanguagesModule } from './modules/languages/languages.module';
import { TranslationKeyModule } from './modules/translation-keys/translation-keys.module';
import { TranslationModule } from './modules/translations/translations.module';
import { DynamicTranslationModule } from './modules/dynamic-translations/dynamic-translation.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolePermissionModule } from './modules/role-permissions/role-permissions.module';
import { UsersModule } from './modules/users/users.module';
import { UserRolesModule } from './modules/user-roles/user-roles.module';

@Module({
  imports: [
    LanguagesModule,
    TranslationKeyModule,
    TranslationModule,
    DynamicTranslationModule,
    RolesModule,
    PermissionsModule,
    RolePermissionModule,
    UsersModule,
    UserRolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
