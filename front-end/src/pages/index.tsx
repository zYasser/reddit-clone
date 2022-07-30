import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClinet";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  if (!fetching && !data) {
    return <div>There is not post available</div>;
  }
  return (
    <>
      <Layout>
        <Flex>
          <Heading>Reddit-Clone</Heading>
          <NextLink href={"/create-post"}>
            <Button ml={"auto"}>Create Post</Button>
          </NextLink>
        </Flex>
        <br />
        {!data && fetching ? (
          <div>Loading...</div>
        ) : (
          <Stack spacing={8}>
            {data!.posts.posts.map((e) => (
              <Flex key={e.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={e} />
                <Box>
                  <Heading fontSize="xl">{e.title}</Heading>
                  <Text>posted by {e.creator.username}</Text>
                  <Text mt={4}>{e.textSnippet}...</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        )}
        {data && data.posts.hasMore ? (
          <Flex>
            <Button
              m={"auto"}
              isLoading={fetching}
              my={8}
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
            >
              Load more
            </Button>
          </Flex>
        ) : (
          <Text textAlign={"center"}>Nothing More to load</Text>
        )}
      </Layout>
    </>
  );
}
Index.getInitialProps = async (ctx) => { console.log(ctx.req.headers.cookie) };
export default withUrqlClient(createUrqlClient, { ssr:true})(Index);
