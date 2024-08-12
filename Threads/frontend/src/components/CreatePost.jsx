import React, { useState,useRef } from 'react'
import { Button , useColorModeValue } from '@chakra-ui/react'
import{AddIcon } from '@chakra-ui/icons'
import {BsFillImageFill} from 'react-icons/bs'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
  import { useDisclosure } from '@chakra-ui/react'
  import { Textarea } from '@chakra-ui/react'
import { FormControl } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import usePreviewImg from '../hooks/usePreviewImg'
import { Image } from '@chakra-ui/react'             
import { Flex,CloseButton } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atom/userAtom'
import useShowToast from '../hooks/useShowToast'
import postsAtom from '../atom/postsAtom'
import {useParams} from "react-router-dom"

const MAX_CHAR=500

const CreatePost = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [postText,setPostText]=useState('')
    const [remainingChar,setRemainingChar]=useState(MAX_CHAR)
    const { handleImageChange,imgUrl,setImgUrl} = usePreviewImg()
    const imageRef=useRef(null)
    const user =useRecoilValue(userAtom)
    const [posts,setPosts]=useRecoilState(postsAtom)
    const showToast = useShowToast()
    const [loading,setLoading]=useState(false)
    const { username } = useParams()
  

    const handleTextChange=(e)=>{
      const inputText = e.target.value
      if(inputText.length > MAX_CHAR){
        const truncatedText = inputText.slice(0,MAX_CHAR)
        setPostText(truncatedText)
        setRemainingChar(0)
      } else{
        setPostText(inputText)
        setRemainingChar(MAX_CHAR-inputText.length)
      }
    }

    const handleCreatePost = async ()=>{
      setLoading(true)
       try {
        const res= await fetch("/api/posts/create",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({postedBy:user._id, text:postText,img:imgUrl}),
        })
        const data = await res.json()
        console.log(data)
        if(data.error){
          showToast("Error",data.error,"error")
          return
        }
        showToast("Success","Post Created Successfully","success")
          if(username === user.username){
              setPosts([data, ...posts])
              
        }
        console.log(`this is ${username} and this is ${user.username} and this is ${posts}`)
        onClose()
        setPostText("")
        setImgUrl("")
       } catch (error) {
        showToast("Error",error,"error")
       } finally{
        setLoading(false)
       }
    }
   
 
    return (
    <>
    <Button bg={useColorModeValue("gray.300","gray.dark")} onClick={onOpen} position={"fixed"} bottom={10} right={10}>
    <AddIcon/>
    </Button>
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>

          <FormControl>
          <Textarea placeholder='Write about your post' value={postText} onChange={handleTextChange} />
          <Text fontSize={"xs"} fontWeight={"bold"} textAlign={"right"} m={"1"} color={'gray.800'} >
          {remainingChar}/{MAX_CHAR} characters left
          </Text>
          <Input type='file' hidden ref={imageRef} onChange={handleImageChange} />
          <BsFillImageFill style={{marginLeft:"5px",cursor:"pointer"}} size={16}
           onClick={()=>imageRef.current.click()}/>
          </FormControl>

          {imgUrl &&(
            <Flex mt={5} w={"full"} position={"relative"}>
              <Image src={imgUrl} alt='Selected Image Not Showing'/>
              <CloseButton onClick={()=>{
                setImgUrl("")
              }}
              bg={"gray.800"}
              position={"absolute"} top={2} right={2}/> 
            </Flex>
          )}

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleCreatePost} isLoading={loading}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreatePost