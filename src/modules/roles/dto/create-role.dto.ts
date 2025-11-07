import { IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsDefined({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must be shorter than or equal to 100 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must be shorter than or equal to 255 characters' })
  description?: string;
}
