import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

export const createVoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.find(keys as any);
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      const upvote = keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
      );
      console.log(upvote);

      return upvote;
    }
  );

// [{postId: 5, userId: 10}]
// [{postId: 5, userId: 10, value: 1}]
