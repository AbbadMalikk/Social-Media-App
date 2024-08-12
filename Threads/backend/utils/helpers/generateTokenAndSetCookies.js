import jwt from 'jsonwebtoken'

const generateTokenAndSetCookies=(userID,res)=>{
    const token=jwt.sign({userID},process.env.JWT_SECRET,{
        expiresIn:'15d'
    })

    res.cookie("jwt",token,{
        httpOnly:true, // makes it more secure 
        maxAge:15*24*60*1000,
        sameSite:"strict",//CSRF makes it more protective
    })
    return token;
}

export default generateTokenAndSetCookies