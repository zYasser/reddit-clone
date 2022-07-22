import { Box, Button ,Link} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState } from "react";
import { InputField } from "../../components/InputFieldProps";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createURqlClinet";
import { toErrorMap } from "../../utils/ToErrorMap";
import NextLink from "next/link";
interface tokenProps {}

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [res, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError]=useState('')
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token: token,
          });
          if (response?.data.changePassword.errors) {
            const errorMap=toErrorMap(response.data.changePassword.errors)
            if('token' in errorMap){
                setTokenError(errorMap.token)
            }
            setErrors(errorMap);
          } else {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="new password"
            ></InputField>
        {tokenError ? (<Box color='red'>{tokenError}
        
        <NextLink href='forget-password'>
          <Link>
            Forget My Password
          </Link>
        </NextLink>
        </Box>
        
        ) : null}
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};
export default withUrqlClient(createUrqlClient)(ChangePassword);
