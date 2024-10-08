import { Button } from '@chakra-ui/react'
import { Container } from '@chakra-ui/react'
import { Routes,Route,Navigate } from 'react-router-dom'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import AuthPage from './pages/AuthPage'
import { useRecoilValue } from 'recoil'
import userAtom from './atom/userAtom'
import UpdateProfilePage from './pages/UpdateProfilePage'
import CreatePost from './components/CreatePost'
function App() {
  const user = useRecoilValue(userAtom)
  console.log(user)
  return (
    <Container maxW='620px'>
      <Header/>
    <Routes>
      <Route path='/' element={user? <HomePage/>: <Navigate to="/auth" /> } />

      <Route path='/auth' element={!user ? <AuthPage/>: <Navigate to="/" /> } />
      
      <Route path='/update' element={user ? <UpdateProfilePage/>: <Navigate to="/auth" /> } />

      <Route path='/:username' element={user ? <>	<UserPage />	<CreatePost />	</>	: <Navigate to="/auth" />}/>
      <Route path="/:username/post/:pid" element={<PostPage/>}/>
    </Routes>
    
    
   
    </Container>
    
  )
}

export default App
