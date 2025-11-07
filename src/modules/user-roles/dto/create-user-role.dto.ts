import { IsDefined, IsInt, Min } from 'class-validator';

export class CreateUserRoleDto {
  @IsDefined({ message: 'User ID is required' })
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be a positive number' })
  userId: number;

  @IsDefined({ message: 'Role ID is required' })
  @IsInt({ message: 'Role ID must be an integer' })
  @Min(1, { message: 'Role ID must be a positive number' })
  roleId: number;
}
