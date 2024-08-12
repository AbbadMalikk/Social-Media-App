import React, { useState } from 'react'
import { Box,VStack } from '@chakra-ui/react'
import { Flex,Button} from '@chakra-ui/react'
import { Avatar } from '@chakra-ui/react'
import { Text, Link } from '@chakra-ui/react'
import { BsInstagram } from 'react-icons/bs'
import { CgMoreO } from 'react-icons/cg'
import { Menu,MenuButton,MenuItem,MenuList,Portal } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import userAtom from '../atom/userAtom'
import {Link as RouterLink} from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'

const UserHeader = ({user}) => {

    
    const [updating,setUpdating]=useState(false)
    const showToast = useShowToast()
    const currentUser = useRecoilValue(userAtom)
    const [following,setFollowing]= useState(user.followers.includes(currentUser?._id))
    console.log(following)
        const toast=useToast()
    const copyURL=()=>{
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(()=>{
           toast({title:"URL COPIED",description: "Url is copied to your clipboard", status:"success",duration:4000});
        })
    }
 
    const handleFollowUnfollow = async () => {
        if(!currentUser){
            showToast("Error","please login to follow","error");
            return;
        }
        setUpdating(true)
        try {
            const res = await fetch(`/api/users/follow/${user._id}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                }
            })
            const data = await res.json()
            if(data.error){
                showToast("Error",data.error,"error")
                return; 
                }
            if(following){
                showToast("Success",`Unfollowed ${user.name}`,"success" )
                user.followers.pop()//updates only on client side
            }    else{
                showToast("Success",`Followed ${user.name}`,"success" )
                user.followers.push(currentUser?._id);//updates only on client side
            }

            setFollowing(!following)
        } catch (error) {
            showToast("Error",error,"error")
        } finally{
            setUpdating(false)
        }
    }

    return (
    <VStack gap={4} alignItems={"start"}>
        <Flex justifyContent={"space-between"} w={"full"}>
            <Box>
                <Text fontSize={"2xl"} fontWeight={"bold"}>{user.username}</Text>
            <Flex gap={2} alignItems={"center"}>
                <Text fontSize={"sm"}>{user.name}</Text>
                <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
                threads.net
                </Text>
            </Flex>
            </Box>
            <Box>
            {user.profilePic && (
  <Avatar
    name={user.name}
    src={user.profilePic}
    size={{
      base: "md",
      md: "xl",
    }}
  />
)}
{!user.profilePic && (
  <Avatar
    name={user.name}
    src="https://bit.ly/broken-link"
    size={{
      base: "md",
      md: "xl",
    }}
  />
)}

            </Box>
        </Flex>
        <Text>{user.bio}</Text>
        {currentUser?._id === user._id && (
            <Link as={RouterLink} to='/update'>
            <Button size={"md"}>
                Update Profile
            </Button>
            </Link>
        )}
         {currentUser?._id !== user._id && (
            
            <Button size={"md"} onClick={handleFollowUnfollow} isLoading={updating}>
                {following ? "Unfollow" : "Follow"}
            </Button>
         
        )}

        <Flex w={"full"} justifyContent={"space-between"}> 
            <Flex gap={2} alignItems={"center"}>
                <Text color={"gray.light"}>{user.followers.length} Followers</Text>
                <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
                <Link color={"gray.light"}>instagram.com</Link>
            </Flex>
            <Flex>
                
            <Box className='icon-container'>
                <BsInstagram size={24} cursor={"pointer"}/>
            </Box>
            
            <Box className='icon-container'>
            <Menu>
            <MenuButton>
                <CgMoreO size={24} cursor={"pointer"}/>
            </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                   <MenuItem bg={"gray.dark"} color={"gray.light"} onClick={copyURL}> Copy Link</MenuItem>
                </MenuList>
              </Portal>
            </Menu>
         </Box>
        </Flex>
    </Flex>

            <Flex w={"full"}>
            <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"}>
            <Text fontWeight={"bold"}>Threads</Text>
            </Flex>
            <Flex flex={1} borderBottom={"1px solid gray"} justifyContent={"center"} color={"gray.light"} pb="3" cursor={"pointer"} >
                <Text fontWeight={"bold"}>Replies</Text>
            </Flex>
            </Flex>
    </VStack>
  )
}

export default UserHeader
