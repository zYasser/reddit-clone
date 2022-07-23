import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createURqlClinet";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import {Link} from "@chakra-ui/react"
import NextLink from "next/link";
const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Layout>
      <NextLink href={"/create-post"}>
          <Link>
            Create post
          </Link>
        </NextLink>
        <br />
        {!data ? (
          <div>Loading...</div>
        ) : (
          data.posts.map((e) => <div key={e.id}>{e.title}</div>)
        )}
      </Layout>
    </>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
