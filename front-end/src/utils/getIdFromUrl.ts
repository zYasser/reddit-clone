import { useRouter } from "next/router";

export const getIdFromUrl = () => {
  const router = useRouter();
  return typeof router.query.id === "string"
    ? parseInt(router.query.id as string)
    : -1;
};
