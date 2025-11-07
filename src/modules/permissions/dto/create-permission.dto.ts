import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
    @IsDefined({ message: 'Name is required' })
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(100, { message: 'Description must be shorter than or equal to 100 characters' })
    name: string;

    @IsDefined({ message: 'endpoint is required' })
    @IsNotEmpty({ message: 'endpoint is required' })
    @IsString({ message: 'endpoint must be a string' })
    @MaxLength(100, { message: 'endpoint must be shorter than or equal to 100 characters' })
    endpoint: string;
}
