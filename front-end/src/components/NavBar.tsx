import { Box, Button, Flex, Heading, IconButton, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { MeQuery, useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { AddIcon } from "@chakra-ui/icons";
let user: MeQuery;
interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  const [{ data }] = useMeQuery({ pause: isServer() });
  let body = null;

if (!data?.me) {
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
      <Flex alignItems={"center"}>
        <NextLink href={"/create-post"}>
          <IconButton
            variant="ghost"
            size={"sm"}
            mr={"2"}
            aria-label="Create Post"
            icon={<AddIcon />}
            title="Create Post"
          />
        </NextLink>
        <div>{data.me.username}</div>

        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          ml={3}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="blue.300" p={"4"} pos="sticky" top={0} zIndex={1}>
      <NextLink href={"/"}>
        <Link>
          <Heading fontSize={"20"} color={"#E1E5EE"}>
            Reddit
          </Heading>
        </Link>
      </NextLink>

      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
export { user };
