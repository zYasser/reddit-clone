import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonProps {
  id: number;
  creatorId:number
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({
  id,creatorId
}) => {
  const [{ data: meData }] = useMeQuery();
  if(meData?.me?.id !== creatorId){
    return null
  }

  const [, deletePost] = useDeletePostMutation();

  return (
    <Box>
      <IconButton
        variant="ghost"
        size={"sm"}
        aria-label="Delete Post"
        icon={<DeleteIcon />}
        title="Delete Post"
        color={"red"}
        onClick={() => {
          deletePost({ id });
        }}
      />
      <NextLink href={"/post/edit/[id]"} as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          variant="ghost"
          size={"sm"}
          aria-label="Edit Post"
          icon={<EditIcon />}
          title="Edit Post"
          color={"grey"}
        />
      </NextLink>
    </Box>
  );
};
