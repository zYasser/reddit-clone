import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createURqlClinet";
const Index = () => {
  const [{ data,fetching }] = usePostsQuery({
    variables: {
      limit: 7,
    },
  });
  if(!fetching && !data){
    return <div>There is not post available</div>
  }
  return (
    <>
      <Layout>
        <Flex>
          <Heading>Reddit-Clone</Heading>
          <NextLink href={"/create-post"}>
            <Button ml={'auto'}>Create Post</Button>
          </NextLink>
        </Flex>
        <br />
        {!data  && fetching ? (
          <div>Loading...</div>
        ) : (
          <Stack spacing={8}>
            {data.posts.map((e) => (
              <Box key={e.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{e.title}</Heading>
                <Text mt={4}>{e.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
        )}
        {data ? (
          <Flex>
            <Button m={'auto'} isLoading={fetching} my={8}>
              Load more
            </Button>
          </Flex>
        )  : null}
      </Layout>
    </>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
