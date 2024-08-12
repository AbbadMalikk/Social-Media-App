import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
import{v2 as cloudinary} from "cloudinary"
import mongoose from "mongoose";

const getUserProfile = async (req,res)=>{
   
    const { query } = req.params;
    try {
        let user;
        
        if(mongoose.Types.ObjectId.isValid(query)){
            user= await User.findOne({_id:query}).select("-password").select("-updatedAt")
        } else{
            user= await User.findOne({username:query}).select("-password").select("-updatedAt")
        }
        
        if(!user) return  res.status(404).json({error:"User not found"})  


        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error: error.message})
        console.log("Error in getUserProfile:",error.message)
    }

}

const signupUser= async (req,res)=>{

    try{
        const {name,email,password,username}=req.body;
        const user= await User.findOne({$or:[{email},{username}]})

        if(user){
            return res.status(400).json({error:"User already exists."})
        }

        const salt =await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser =new User({
            name,
            email,
            username,
            password:hashedPassword,
        });
        await newUser.save();

        if(newUser){
            generateTokenAndSetCookies(newUser._id,res);
            res.status(201).json({
                _id:newUser._id,
                name:newUser.name,
                email:newUser.email,
                username:newUser.username,
                bio:newUser.bio,
                profilePic:newUser.profilePic
            })
        } else{
            res.status(400).json({error:"Invalid user data"})
        }

    } catch(err){
        res.status(500).json({error: err.message})
        console.log("Error in signupUser:",err.message)
    }

}

const loginUser=async (req,res)=>{
    try{
        const {password,username}=req.body;
        const user =await User.findOne({username})
        const isPasswordCorrect = await bcrypt.compare(password,user?.password || "");

        if(!user || !isPasswordCorrect) return res.status(400).json({error:"Invalid username or password"})
       
        generateTokenAndSetCookies(user._id,res)

        res.status(200).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            username:user.username,
            bio:user.bio,
            profilePic:user.profilePic
        })

    } catch(err){
        res.status(500).json({error:err.message})
        console.log("Error in loginUser: ",err.message)
    }

}

const logoutUser=async (req,res)=>{
    try{

        res.cookie("jwt","",{maxAge:1})
        res.status(200).json({
            message:"User Logged out successfully! "
        })

    } catch(error){
        res.status(500).json({error:error.message})
        console.log("Error in logoutUser: ", error.message)
    }
}

const followUnfollowUser =async (req,res)=>{
        try {
            const {id} = req.params;
            const userToModify = await User.findById(id)
            const currentUser = await User.findById(req.user._id)
            if(id=== req.user._id.toString()) return res.status(400).json({error:"You cannot follow or Unfollow yourself"})

            if(!userToModify || !currentUser) return res.status(400).json({error:"User not found"})

            const isFollowing = currentUser.following.includes(id)

            if(isFollowing){
                //unfollow user 
                // modify current users following number and the userToModify followers
                await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}})
                await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
                res.status(200).json({message:"User Unfollowed Successfully"})
            } else{
                //Follow User
                await User.findByIdAndUpdate(req.user._id,{$push:{following:id}})
                await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}})
                res.status(200).json({message:"User Followed Successfully"})
            }

        } catch (error) {
            res.status(500).json({error:error.message})
            console.log("Error in followUnfollowUser: ", error.message)
        }
}

const updateUser = async (req,res)=>{
    const {name,email,password,username,bio}=req.body;
    let { profilePic } = req.body
    const userID = req.user._id
    try {
        let user = await User.findById(userID)
        if(!user) return res.status(400).json({error:"user not found"})

        if(req.params.id !== userID.toString()) return res.status(400).json({error:"You cannot update other Users Profile"})

        if(password){
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password,salt)
            user.password = hashedPassword
        }

        if(profilePic){
            if(user.profilePic){
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic)
            profilePic = uploadedResponse.secure_url;
        }

        user.name= name || user.name;
        user.email= email || user.email;
        user.username= username || user.username;
        user.profilePic= profilePic || user.profilePic;
        user.bio= bio || user.bio;

        user = await user.save()

        await Post.updateMany(
            {"replies.userId":userID},
            {
                $set:{
                    "replies.$[reply].username":user.username,
                    "replies.$[reply].userProfilePic":user.profilePic
                }
            },
            {arrayFilters:[{"reply.userId":userID}]}
        )
        user.password = null;    
        res.status(200).json(user)
        
    } catch (error) {
        res.status(500).json({error:error.message})
        console.log("Error in updateUser: ", error.message)
    }
}

const deleteProfilePic = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || !user.profilePic) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        // Extract the public ID from the profilePic URL
        const publicId = user.profilePic.split('/').pop().split('.')[0];

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Update the user document to remove the profilePic field
        user.profilePic = '';
        await user.save();

        res.status(200).json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log('Error deleting profile picture:', error.message);
    }
};

export{signupUser,loginUser,logoutUser,followUnfollowUser, updateUser,getUserProfile, deleteProfilePic} 