import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginAdminDto {
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  user: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;
}
