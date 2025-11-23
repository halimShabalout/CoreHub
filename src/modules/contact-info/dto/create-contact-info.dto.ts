import { IsDefined, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateContactInfoDto {
  @IsDefined({ message: 'Phone is required' })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @IsDefined({ message: 'Whatsapp is required' })
  @IsNotEmpty({ message: 'Whatsapp is required' })
  @IsString({ message: 'Whatsapp must be a string' })
  whatsapp: string;

  @IsDefined({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @IsOptional()
  @IsString({ message: 'address must be a string' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  longitude?: number;
}
