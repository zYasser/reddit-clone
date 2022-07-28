import { TriangleUpIcon, TriangleDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostResFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostResFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {

  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");

  const [, vote] = useVoteMutation();
  return (
    <Flex
      direction={"column"}
      justifyContent="center"
      alignItems={"center"}
      mr={"5"}
    >
      <IconButton
        aria-label="updoot post"
        icon={<TriangleUpIcon />}
        size="24px"
        p={"1"}
        variant={"ghost"}
        color={post.voteStatus===1 ? 'green' : null}
        isLoading={loadingState === "updoot-loading"}
        onClick={async () => {
          setLoadingState("updoot-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          
          setLoadingState("not-loading");
        }}
      ></IconButton>
      {post.points}

      <IconButton
        aria-label="downdoot post"
        icon={<TriangleDownIcon />}
        size="24px"
        p={"1"}
        variant={"ghost"}
        color={post.voteStatus===-1 ? 'red' : null}

        isLoading={loadingState === "downdoot-loading"}
        onClick={async () => {
          setLoadingState("downdoot-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
      ></IconButton>
    </Flex>
  );
};





