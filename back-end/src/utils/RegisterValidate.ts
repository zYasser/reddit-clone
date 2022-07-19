import { EmailValidation } from "./EmailValidation";
import { UserResponse } from "src/utils/UserResponse";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
export const RegisterValidate = (
  options: UsernamePasswordInput
): UserResponse => {
  if (!EmailValidation(options.email)) {
    return {
      errors: [
        {
          field: "email",
          message: "You have entered an invalid email address!",
        },
      ],
    };
  }
  if (options.username.includes('@')) {
    return {
      errors: [
        {
          field: "username",
          message: "you can't include '@' in your username",
        },
      ],
    };
  }
  if (options.username.length < 2) {
    return {
      errors: [
        {
          field: "username",
          message: "username can not be less than 2 character ",
        },
      ],
    };
  }
  if (options.password.length <= 3) {
    return {
      errors: [
        {
          field: "password",
          message: "password can not be less than 6 character",
        },
      ],
    };
  }
  return {};
};
