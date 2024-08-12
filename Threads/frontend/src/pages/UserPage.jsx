import React, { useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import { useState } from 'react'
import useShowToast from '../hooks/useShowToast'
import{ useParams } from 'react-router-dom'
import {Spinner , Flex, Button } from '@chakra-ui/react'
import Post from '../components/Post'
import { useRecoilState } from 'recoil'
import postsAtom from '../atom/postsAtom'
import useGetUserProfile from '../hooks/useGetUserProfile'

 
const UserPage = () => {
  const {user,loading}= useGetUserProfile()
  const {username} = useParams()
  const showToast = useShowToast()
  const [posts,setPosts]=useRecoilState(postsAtom)
  const [fetchingPosts,setFetchingPosts]=useState(true)
  useEffect(()=>{

    const getPosts =async()=>{
      if(!user) return
      setFetchingPosts(true)
      try {
        const res = await fetch(`/api/posts/user/${username}`)
        const data = await res.json()
        if(data.error){
          showToast("Error",data.error,"error")
        }
        console.log(data)
        setPosts(data)
      } catch (error) {
        showToast("Error",error.message,"error")
        setPosts([])
      } finally{
        setFetchingPosts(false)
      }
     }


    
    getPosts()
  },[username,showToast,setPosts,user]);

 
 
  if(!user && loading){
    return(<Flex justifyContent={"center"}>
      <Spinner size='xl'/>
    </Flex> 
    )
  }

  if(!user && !loading){
    return <h1>User not Found</h1>
  }

  return (
    <>
      <UserHeader user={user}/>
      {!fetchingPosts && posts.length ===0 && <h1 style={{ marginTop: '20px' }}>User has no post yet ...🕊 </h1>}
      {fetchingPosts && (
        <Flex justifyContent = {"center"} my={12}>
          <Spinner size={"xl"}/> 

        </Flex>
      )}

      {posts.map((post)=>(
        <Post key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </>
  )
}

export default UserPage
