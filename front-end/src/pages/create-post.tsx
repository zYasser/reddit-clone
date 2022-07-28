import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputFieldProps";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClinet";
import { useIsAuth } from "../utils/useIsAuth";

 const CreatePost: React.FC<{}> = ({}) => {

    const router =useRouter()
    useIsAuth()
    const [,createPost]=useCreatePostMutation()
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
            const res=await createPost({PostInput:values})
            router.push('/')
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="title"
              label="Title"
            ></InputField>
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              ></InputField>
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Create A Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default  withUrqlClient(createUrqlClient)(CreatePost);
