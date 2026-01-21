export enum Role {
  USER = 'USER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  phoneNumber: string | null;
  address: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  // Extended profile information
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserDto {
  name?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateUserRoleDto {
  role: Role;
}
