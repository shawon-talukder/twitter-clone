import serverAuth from "@/libs/serverAuth";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/libs/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).end();
  }

  try {
    const { userId } = req.body;

    const { currentUser } = await serverAuth(req, res);

    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid credentials");
    }

    // find user from database
    const user = await prisma?.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("Invalid user id!");
    }

    let updatedFollowingIds = [...(user.followingIds || [])];

    // push current user's id to the user's id that want to follow
    if (req.method === "POST") {
      updatedFollowingIds.push(userId);

      // send notification to the user

      await prisma.notification.create({
        data: {
          link: `/user/${currentUser?.id}`,
          body: `@${currentUser?.username} started following you! `,
          userId: user?.id,
        },
      });

      await prisma.user.update({
        where: { id: user?.id },
        data: { hasNotification: true },
      });
    }

    // check method is "DELETE" or not. Then remover current user id from users following id
    if (req.method === "DELETE") {
      updatedFollowingIds = updatedFollowingIds.filter((id) => id !== userId);
    }

    // update user's following ids
    const updatedUser = await prisma?.user.update({
      where: { id: currentUser?.id },
      data: { followingIds: updatedFollowingIds },
    });

    // success message
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
