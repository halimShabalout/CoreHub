import { IsDefined, IsInt, Min } from 'class-validator';

export class CreateRolePermissionDto {
  @IsDefined({ message: 'Role ID is required' })
  @IsInt({ message: 'Role ID must be an integer' })
  @Min(1, { message: 'Role ID must be a positive number' })
  roleId: number;

  @IsDefined({ message: 'Permission ID is required' })
  @IsInt({ message: 'Permission ID must be an integer' })
  @Min(1, { message: 'Permission ID must be a positive number' })
  permissionId: number;
}
