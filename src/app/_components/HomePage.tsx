"use client";

import {useEffect, useState} from "react";
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [allPosts, setAllPosts] = useState([])
  
  
  
  return (<div>hello from hom epage (client)
  <button>load more</button></div>)
}