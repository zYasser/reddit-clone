import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay, Button, useDisclosure
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
import { InputField } from "../components/InputFieldProps";
import { Wrapper } from "../components/Wrapper";
import { useForgetPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClinet";

interface forgetPasswordProps {}

export const forgetPassword: React.FC<forgetPasswordProps> = ({}) => {
  let alert = false;
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()


  const [, forgetPassword] = useForgetPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
            forgetPassword(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="email"
              placeholder="Enter Your Email"
              label="Enter Your Email"
            ></InputField>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              onClick={onOpen}
            >
              Forget My Password
            </Button>
          </Form>
        )}
      </Formik>
    
      {{isOpen} ? (
              <AlertDialog
              motionPreset='slideInBottom'
              leastDestructiveRef={cancelRef}
              onClose={onClose}
              isOpen={isOpen}
              isCentered
            >
              <AlertDialogOverlay />
        
              <AlertDialogContent>
                <AlertDialogHeader>DONE</AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                Thanks! If your email address match, you'll get an email with a link to reset your password shortly.
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose}>
                    Okay
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        
      )
       : null}
    </Wrapper>
  );
};
export default withUrqlClient(createUrqlClient)(forgetPassword);
