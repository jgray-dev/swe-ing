"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/shared/react";
import { getDbUser, nextPostPage, singlePost } from "~/server/api/queries";
import { PostCard } from "~/app/post/[id]/_PostCard";
import type { post, user } from "~/app/_functions/interfaces";

export default function PostPage({ params }: { params: { id: string } }) {
  const [postId, setPostId] = useState<number>(Number(params.id));
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [page, setPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [userId, setUserId] = useState<number>();
  const { user, isSignedIn } = useUser();
  const [commentCards, setCommentCards] = useState<React.ReactElement[]>([]);
  const [postCard, setPostCard] = useState<React.ReactElement>(<></>);

  function commentOnPost() {
    console.log("user wants to comment :P");
  }

  async function getPost(userid: number) {
    const pagePost = await singlePost(postId);
    if (user?.id)
      setPostCard(<PostCard post={pagePost as post} user_id={userid} />);
  }

  async function getUser() {
    if (user?.id) {
      const dbUser = await getDbUser(user.id);
      setUserId(dbUser?.id);
      void getPost(Number(dbUser?.id));
    }
  }

  useEffect(() => {
    void getUser();
    setPostId(Number(params.id));
  }, [user]);

  // useEffect(() => {
  //   console.log("useEffect getComment")
  //   void getComments()
  // }, [page]);

  async function getComments() {
    const newData = await nextPostPage(page, postId);
    console.log("Newdata fetched", newData);
  }
  //Comments infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      const div = document.getElementById("scrolls");
      const scrollTop = div ? div.scrollTop : 0;
      const scrollHeight = div ? div.scrollHeight : 0;
      const clientHeight = div ? div.clientHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 1250 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    };
    const div = document.getElementById("scrolls");
    div?.addEventListener("scroll", handleScroll);
    if (end) {
      div?.removeEventListener("scroll", handleScroll);
    }
    return () => {
      div?.removeEventListener("scroll", handleScroll);
    };
    //eslint-disable-next-line
  }, [loading]);

  return (
    <div className={"h-screen w-screen pt-20 text-white"}>
      <div
        className="no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll pt-20 sm:w-96"
        id={"scrolls"}
      >
        <div className={"overflow-x-hidden overflow-y-scroll"} id="scrolls">
          <div className={"mt-24 rounded-lg border border-white/70 p-2 pb-12"}>
            {postCard}
            {commentCards}
          </div>
          <div className={"text-center"}>
            <span className={""}>
              The end
              <br />
            </span>
            <div
              className={"cursor-pointer select-none underline"}
              onClick={() => commentOnPost()}
            >
              How about replying to this post!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";
//
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import { getDbUser, nextPostPage } from "~/server/api/queries";
// import Link from "next/link";
// import type { like, post } from "~/app/_components/interfaces";
// import { useUser } from "@clerk/shared/react";
// import { CiShare1 } from "react-icons/ci";
// import { GoCommentDiscussion } from "react-icons/go";
// import { PiDotsNine } from "react-icons/pi";
// import LikeButton from "~/app/_components/LikeButton";
//
// export default function HomePage() {
//
//   async function dbUser(clerkId: string) {
//     return getDbUser(clerkId);
//   }
//   useEffect(() => {
//     void firstLoad();
//     //eslint-disable-next-line
//   }, [isSignedIn]);
//
//   async function firstLoad() {
//     if (!userId) {
//       if (isSignedIn) {
//         await dbUser(user.id).then(async (data) => {
//           if (data) {
//             setUserId(data.id);
//             setLoading(true);
//             void (await fetchData(data.id));
//           } else {
//             console.error("Error fetching user from local database");
//           }
//         });
//       }
//     }
//   }
//
//   useEffect(() => {
//     const handleScroll = () => {
//       const div = document.getElementById("scrolls");
//       const scrollTop = div ? div.scrollTop : 0;
//       const scrollHeight = div ? div.scrollHeight : 0;
//       const clientHeight = div ? div.clientHeight : 0;
//       if (scrollTop + clientHeight >= scrollHeight - 750 && !loading) {
//         console.log("Loading more posts");
//         void fetchData(userId);
//         setPage((prevPage) => prevPage + 1);
//       }
//     };
//     const div = document.getElementById("scrolls");
//     div?.addEventListener("scroll", handleScroll);
//     if (end) {
//       div?.removeEventListener("scroll", handleScroll);
//     }
//     return () => {
//       div?.removeEventListener("scroll", handleScroll);
//     };
//     //eslint-disable-next-line
//   }, [loading]);
//
//   async function fetchData(user_id?: number) {
//     setLoading(true);
//     const data = await nextPostPage(page);
//     if (!data) {
//       console.warn("No data returned from server");
//       return;
//     }
//     if (data.length > 0) {
//       const newPosts = data.filter(
//         (newPost) => !allPosts.some((post) => post.id === newPost.id),
//       );
//       if (newPosts.length > 0) {
//         const newLikedPosts = [...likedPosts];
//         newPosts.forEach((post: post) => {
//           if (post.likes) {
//             post.likes.forEach((like: like) => {
//               if (like.user_id === user_id) {
//                 newLikedPosts.push(post.id);
//               }
//             });
//           }
//         });
//         setLikedPosts(newLikedPosts);
//         setAllPosts([...allPosts, ...newPosts]);
//         setCards([...cards, ...getCards(newPosts, user_id)]);
//         setLoading(false);
//       }
//     } else {
//       console.warn("End of posts");
//       setEnd(true);
//     }
//     if (!end) {
//       setLoading(false);
//     }
//   }
//
//   function showContextMenu(id: number) {
//     console.log("context menu for post ", id);
//   }
//
//
//   function getCards(data: post[], user_id?: number): React.ReactElement[] {
//     return data.map((post) => getCard(post, user_id));
//   }
//
//   function getCard(post: post, user_id?: number): React.ReactElement {
//     if (userId) {
//       user_id = userId;
//     }
//     const liked = post.likes?.some((like) => like.user_id === user_id) ?? false;
//     return (
//       <div
//         key={post.created_at + post.id + Math.random()}
//         className={
//           "backdrop-blur-xs my-2 min-h-fit w-[99%] translate-x-[0.5%] rounded-lg border border-white/50 bg-black/90 p-1.5 text-zinc-200 duration-300"
//         }
//       >
//         <div className={"flex flex-col"}>
//           <div className={"flex h-full min-h-36 w-full flex-row"}>
//             <div className={"flex flex-col"}>
//               <div
//                 className={
//                   "flex w-20 min-w-20 max-w-20 flex-col items-center border-r border-white/50 pr-2 text-xs"
//                 }
//               >
//                 <div className="relative h-12 w-12 overflow-hidden rounded-full">
//                   <Link href={`/user/${post.author_id}`}>
//                     <Image
//                       // @ts-expect-error fuck typescript
//                       src={post.author.image_url}
//                       fill
//                       loading={"lazy"}
//                       className="object-cover"
//                       alt=""
//                       sizes="40px"
//                     />
//                   </Link>
//                 </div>
//                 {/*@ts-expect-error fuck typescript*/}
//                 {post.author.name}
//               </div>
//               <div
//                 className={
//                   "mr-1 h-fit min-h-0 w-20 min-w-20 max-w-20 border-r border-t border-white/50"
//                 }
//               >
//                 <div className={"flex max-h-24 flex-wrap overflow-y-hidden"}>
//                   {post.post_tags
//                     ? post.post_tags.split(",").map((tag) => {
//                       if (tag !== "") {
//                         return (
//                           <Link key={Math.random()} href={`/search/${tag}`}>
//                             <div
//                               key={Math.random()}
//                               className="mx-0.5 ml-0 mt-1 w-fit max-w-20 overflow-x-hidden truncate rounded-sm bg-white/5 p-0.5 text-left text-xs text-zinc-500"
//                               title={tag}
//                             >
//                               {tag}
//                             </div>
//                           </Link>
//                         );
//                       } else {
//                         return null;
//                       }
//                     })
//                     : null}
//                 </div>
//               </div>
//             </div>
//             <Link
//               key={post.created_at + post.id + Math.random()}
//               href={`/post/${post.id}`}
//             >
//               <div
//                 className={
//                   "line-clamp-[10] h-fit max-h-72 min-h-36 min-w-full max-w-full text-wrap break-normal pl-2 text-left"
//                 }
//               >
//                 {post.content}
//               </div>
//             </Link>
//           </div>
//           <div className={"mt-2 border-t border-white/50"}>
//             <div className={"flex flex-row justify-between px-4 pt-1.5"}>
//               <LikeButton
//                 postId={Number(post.id)}
//                 dbliked={liked}
//                 dblikes={post.likes ? post.likes.length : 0}
//               />
//
//               <div className={"group flex flex-row text-zinc-400"}>
//                 <Link href={`/post/${post.id}`}>
//                   <GoCommentDiscussion
//                     className={
//                       "mr-1.5 h-6 w-6 duration-150 group-hover:text-white motion-safe:group-hover:-translate-y-[5%] motion-safe:group-hover:rotate-3"
//                     }
//                   />
//                 </Link>
//                 <span className={"duration-150 group-hover:text-white"}>
//                   {post.comments ? post.comments.length : 0}
//                 </span>
//               </div>
//
//               <div>
//                 <CiShare1
//                   className={
//                     "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:-translate-y-0.5 motion-safe:hover:translate-x-0.5"
//                   }
//                   onClick={() => sharePost(post.id, post.content)}
//                 />
//               </div>
//
//               <div>
//                 <PiDotsNine
//                   className={
//                     "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%]"
//                   }
//                   onClick={() => showContextMenu(post.id)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div>
//       <div
//         className="no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll pt-20 sm:w-96"
//         id={"scrolls"}
//       >
//         <div className={"overflow-x-hidden overflow-y-scroll"}>
//           {cards}
//           <div className={"pb-12 pt-24"}>
//             The end. <br />
//             <Link href={"/newpost"} className={"underline"}>
//               {" "}
//               How about creating a new post
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
