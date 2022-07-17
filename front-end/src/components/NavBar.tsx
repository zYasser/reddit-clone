import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";
interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href={"/register"}>
          <Link mr={2} color="black">
            Register
          </Link>
        </NextLink>
        <NextLink href={"/login"}>
          <Link mr={2} color="black">
            Login
          </Link>
        </NextLink>

      </>
    );
  } else {
    body = (
        <Flex>
          {data.me.username}
          <Button ml={3} variant='link'>Logout</Button>
        </Flex>
    )
  }
  return (
    <Flex bg="blue.300" p={"4"}>
      <Box ml={"auto"}>
        {body}

      </Box>
    </Flex>
  );
};
