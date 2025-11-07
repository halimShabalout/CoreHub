import { IsDefined, IsNotEmpty, IsString, Length, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateLanguageDto {
  @IsDefined({ message: 'Code is required' })
  @IsNotEmpty({ message: 'Code is required' })
  @Length(2, 2, { message: 'Code must be exactly 2 characters' })
  @IsString({ message: 'Code must be a string' })
  code: string;

  @IsDefined({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(50, { message: 'Name must be shorter than or equal to 50 characters' })
  name: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  isDefault?: boolean;
}
