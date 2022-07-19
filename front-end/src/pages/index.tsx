import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createURqlClinet";
import { usePostsQuery } from "../generated/graphql";
const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>Hello World</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((e) => <div key={e.id}>{e.title}</div>)
      )}
    </>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
