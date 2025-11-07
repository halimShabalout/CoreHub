import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LanguagesModule } from './modules/languages/languages.module';
import { TranslationKeyModule } from './modules/translation-keys/translation-keys.module';
import { TranslationModule } from './modules/translations/translations.module';
import { DynamicTranslationModule } from './modules/dynamic-translations/dynamic-translation.module';

@Module({
  imports: [
    LanguagesModule,
    TranslationKeyModule,
    TranslationModule,
    DynamicTranslationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
