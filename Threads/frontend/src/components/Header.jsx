import React from 'react'
import { Link,Flex,Image,useColorMode,Button } from '@chakra-ui/react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import userAtom from '../atom/userAtom'
import {AiFillHome} from 'react-icons/ai'
import { FiLogOut } from "react-icons/fi"
import {RxAvatar} from 'react-icons/rx'
import {Link as RouterLink} from 'react-router-dom'
import useLogout from '../hooks/useLogout'
import authScreenAtom from '../atom/authAtom'
const Header = () => {
 
    const {colorMode,toggleColorMode}=useColorMode()
    const user = useRecoilValue(userAtom)
    const logout = useLogout()
    const setAuthScreen = useSetRecoilState(authScreenAtom)

    return (

      

<Flex justifyContent={"space-between"} mt={6} mb="12">

      {user && (
        <Link as={RouterLink} to="/">
        <AiFillHome size={24}/>
        </Link>
      )}
       {!user && (
        <Link as={RouterLink} to={"/auth"} onClick={()=> setAuthScreen('login')}>
        Login
        </Link>
      )}

    <Image cursor={"pointer"} w={6} src={colorMode==="dark" ? "/light-logo.svg":"/dark-logo.svg"} alt='logo' onClick={toggleColorMode} />

    {user && (
      <Flex alignItems={"center"} gap={4}>

        <Link as={RouterLink} to={`/${user.username}`}>
        <RxAvatar size={24}/>
        </Link>
        <Link to="/auth">
    <Button  size={"xs"} onClick={logout}>
    <FiLogOut size={20}/>       
    </Button>
    </Link>
      </Flex>
      )}

{!user && (
        <Link as={RouterLink} to={"/auth"} onClick={()=> setAuthScreen('signup')}>
        SignUp
        </Link>
      )}  

</Flex>
  )
}

export default Header
