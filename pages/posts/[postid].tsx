import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";

import usePost from "@/hooks/usePost";

import Form from "@/components/Form";
import Header from "@/components/Header";
import PostItem from "@/components/posts/PostItem";
import CommentFeed from "@/components/posts/CommentFeed";

const PostView = () => {
  const router = useRouter();
  const { postid } = router.query as { postid: string };

  const { data: fetchedPost, isLoading } = usePost(postid);

  if (isLoading || !fetchedPost) {
    return (
      <div className="flex justify-center items-center h-full">
        <ClipLoader color={"lightblue"} size={80} />
      </div>
    );
  }
  return (
    <>
      <Header label={"Tweet"} showBackArrow />
      {fetchedPost && <PostItem data={fetchedPost} />}
      <Form postId={postid} isComment placeholder="Tweet your reply" />
      <CommentFeed comments={fetchedPost?.comments} />
    </>
  );
};

export default PostView;
