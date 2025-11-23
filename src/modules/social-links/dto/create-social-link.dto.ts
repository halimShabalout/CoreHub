import { IsDefined, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSocialLinkDto {
  @IsDefined({ message: 'Platform is required' })
  @IsString({ message: 'Platform must be a string' })
  platform: string;

  @IsDefined({ message: 'Icon is required' })
  @IsString({ message: 'Icon must be a string' })
  icon: string;

  @IsDefined({ message: 'URL is required' })
  @IsString({ message: 'URL must be a string' })
  url: string;

  @IsOptional()
  @IsInt({ message: 'Order must be an integer' })
  @Min(0)
  order?: number;
}
