import React, { useState, useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import { Avatar,Text,Image,Box,Spinner } from '@chakra-ui/react'
import Actions from '../components/Actions'
import { Divider } from '@chakra-ui/react'
import Comment from '../components/Comment'
import useGetUserProfile from '../hooks/useGetUserProfile'
import { useParams,useNavigate } from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'
import { formatDistanceToNow } from 'date-fns'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atom/userAtom'
import { DeleteIcon } from '@chakra-ui/icons'
import postsAtom from '../atom/postsAtom'


const PostPage = () => {

  const {user,loading}=useGetUserProfile()
  const showToast= useShowToast()
  const currentUser = useRecoilValue(userAtom)
  const [posts,setPosts]=useRecoilState(postsAtom)
  const {pid} =useParams()
  const navigate = useNavigate()
  const currentPost= posts[0]

  const handleDeletePost = async()=>{
    try {
        
        if(!window.confirm("Are you sure to delete this post?")) return;
        const res = await fetch(`/api/posts/${currentPost._id}`,{
            method:"DELETE",
        })    
        const data= await res.json()
        if(data.error){
            showToast("Error",data.error,"error")
            return;
          }
        showToast("Success","Post Deleted","success")  
        navigate(`/${user.username}`)
    } catch (error) {
        showToast("Error",error.message,"error")
    }
}

  useEffect(() => {
    const getPost = async ()=>{
      setPosts([])
      try {
        const res = await fetch(`/api/posts/${pid}`)
        const data = await res.json()
        if(data.error){
          showToast("Error",data.error,"error")
          return
        }
        console.log(data)
        setPosts([data])
      } catch (error) {
        showToast("Error",error.message,"error")
      }
    }
    getPost()
  }, [showToast,pid,setPosts])

  if(!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"}/>
      </Flex>
    )}
  
    if(!currentPost) return null

  return (
    <>
    <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
        <Avatar src={user.profilePic} size={"md"} name={user.name} />
        <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>{user.username}</Text>
            <Image src='/verified.png' w='4' h={4} ml={4} />
        </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
                        <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>{formatDistanceToNow(new Date(currentPost.createdAt))} ago </Text>
                        {currentUser?._id === user._id && (
                            <DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost}/>
                        )}
                        </Flex>
    </Flex>
    <Text my={3}>{currentPost.text}</Text>
   
    {currentPost.img &&(
        <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
        <Image src={currentPost.img} w={"full"}></Image>
        </Box>
    )}
  
             
                 <Flex gap={3} my={3}>
                  <Actions post={currentPost}/>
                 </Flex>

              
                 <Divider my={4}></Divider>
                  {currentPost.replies.map((reply)=>(

                  <Comment 
                  key={reply._id}
                  reply={reply}/>    

                  ))}


                
    </>
  )
}

export default PostPage
