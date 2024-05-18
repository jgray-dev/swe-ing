"use client";

import {useState} from "react";
import {nextPostPage} from "~/server/api/queries";
export default function HomePage() {
  // const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  // const [allPosts, setAllPosts] = useState([])

  async function getData() {
    const data = await nextPostPage(page)
    console.log(`Entry ${page}`)
    console.log(data)
    setPage(page+1)
  }
  
  return (
  <div>hello from home page (client)
    <br/>
    <button onClick={()=>getData()}>load more</button>
  </div>
  )
}