import { Box, Flex, Heading, Skeleton, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { UpdootSection } from "../../components/UpdootSection";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClinet";

export const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string"
      ? parseInt(router.query.id as string)
      : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  if (fetching) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>Could Not Find the Post</Box>
      </Layout>
    );
  }
  router.query.id;
  return (
    <Layout>
      <Box
        backgroundColor={"#C8E0F4"}
        p="10"
        backdropBlur={"invert(100%)"}
        boxShadow={"lg"}
      >
        <Box>
          <Flex>
            <Heading textAlign={"left"} size="lg" color={"black"}>
              {data?.post?.title}
            </Heading>
          </Flex>
          <Text fontSize={"md"} fontWeight={"bold"} color={"#508AA8"}>
            Posted by {data.post.creator.username}
          </Text>
        </Box>
        <Box
          bg={"#e8eaf6"}
          dropShadow={"2xl"}
          boxShadow={"lg"}
          opacity={"0.9"}
          backdropFilter="auto"
          backdropBlur="6px"
        >
          <Text color={"black"} fontWeight={"medium"} fontSize={"18"}>
            {data?.post?.text}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
