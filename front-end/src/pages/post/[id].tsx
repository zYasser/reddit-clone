import { Box, Flex, Heading, Skeleton, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { EditDeletePostButton } from "../../components/EditDeletePostButton";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClinet";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

export const Post = ({}) => {
  const [{ data, fetching, error }] = useGetPostFromUrl();
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
          <Text fontSize={"md"} fontWeight={"bold"} color={"#508AA8"} mt={1}>
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
          mt={2}
        >
          <Text color={"black"} fontWeight={"medium"} fontSize={"18"}>
            {data?.post?.text}
          </Text>
        </Box>
        <Flex justifyContent={"end"}>
          <EditDeletePostButton
            id={data?.post?.id}
            creatorId={data?.post?.creatorId}
          />
        </Flex>
      </Box>
    </Layout> 
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
