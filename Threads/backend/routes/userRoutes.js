import express from 'express'
import { followUnfollowUser, getUserProfile, loginUser, logoutUser, signupUser, updateUser, deleteProfilePic } from '../controllers/userController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router=express.Router();

router.get("/profile/:query",getUserProfile)
router.post("/signup",signupUser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.post("/follow/:id", protectRoute, followUnfollowUser)
router.put("/update/:id", protectRoute, updateUser)
router.delete('/profile-pic', protectRoute, deleteProfilePic);



export default router