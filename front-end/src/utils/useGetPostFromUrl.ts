import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromUrl=()=>{
    const router = useRouter();
    const intId =
      typeof router.query.id === "string"
        ? parseInt(router.query.id as string)
        : -1;
    return usePostQuery({
      pause: intId === -1,
      variables: {
        id: intId,
      },
    });
  
}