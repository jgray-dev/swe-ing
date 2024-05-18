"use client";

import {useEffect, useState} from "react";
import {api} from "~/trpc/react"

export default function HomePage() {
  // const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [allPosts, setAllPosts] = useState([])
  
  function getNextPage() {
    const { data, isLoading, error } =  api.posts.getHomePage.useQuery({ page: 2 });
    console.log("Page ", page, "content\n", data)
  }
  
  useEffect(()=>{
    getNextPage()
  },[])
  
  return (<div>hello from hom epage (client)
  <button onClick={()=>getNextPage()}>load more</button></div>)
}