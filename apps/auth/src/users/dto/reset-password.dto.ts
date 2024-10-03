import {
  IsNotEmpty,
  IsString,
  IsStrongPassword
} from 'class-validator';
  
  export class ResetPasswordDto {
    @IsStrongPassword()
    password: string;

    @IsString()
    @IsNotEmpty()
    token: string;
  }
  