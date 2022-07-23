import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{fetching:logoutFetching},logout]=useLogoutMutation()
  const [{ data, fetching }] =  useMeQuery({pause:isServer()});
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
          <Button onClick={()=>{
            logout()

          }} isLoading={logoutFetching} ml={3} variant='link'>Logout</Button>
        </Flex>
    )
  }
  return (
    <Flex bg="blue.300" p={"4"} pos='sticky' top={0} zIndex={1}>
      <Box ml={"auto"}>
        {body}

      </Box>
    </Flex>
  );
};
