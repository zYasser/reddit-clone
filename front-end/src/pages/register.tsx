import React from "react";
import { Form, Formik } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputFieldProps";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", passowrd: "" }}
        onSubmit={(values) => console.log(values)}
      >
        {({ values, handleChange }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            ></InputField>
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
            ></InputField>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default Register;
