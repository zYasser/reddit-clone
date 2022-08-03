import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { EditDeletePostButton } from "../components/EditDeletePostButton";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClinet";
const Index = () => {
  const [, deletePost] = useDeletePostMutation();
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
        <br />
        {!data && fetching ? (
          <div>Loading...</div>
        ) : (
          <Stack spacing={8}>
            {data!.posts.posts.map((e) =>
              !e ? null : (
                <Flex key={e.id} p={5} borderWidth="1px">
                  <UpdootSection post={e} />
                  <Box flex={1}>
                    <Flex alignContent={"center"}>
                      <NextLink href="/post/[id]" as={`/post/${e.id}`}>
                        <Link>
                          <Heading fontSize="xl">{e.title}</Heading>
                        </Link>
                      </NextLink>
                    </Flex>
                    <Text mt={-1}>posted by {e.creator.username}</Text>
                    <Flex align={"center"}>
                      <Text mt={3} flex={1}>
                        {e.textSnippet}...
                      </Text>

                      <Box ml={"auto"}>
                        <EditDeletePostButton
                          id={e.id}
                          creatorId={e.creatorId}
                        />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              )
            )}
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
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
