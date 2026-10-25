import jwt from "jsonwebtoken"
import User from "../model/auth.model.js"

export const authMiddleware=async(req,res,next)=>{
  const authorization=req.headers.authorization
  const [scheme,token,...extra]=authorization?.trim().split(/\s+/) ?? []

  if(scheme?.toLowerCase()!=="bearer" || !token || extra.length>0){
    return res.status(401).json({msg:"Authorization must be Bearer <token>"})
  }

  if(!process.env.JWT_SECRET){
    console.error("JWT_SECRET is not configured")
    return res.status(500).json({msg:"Authentication is not configured"})
  }

  let decoded
    try{
  decoded=jwt.verify(token,process.env.JWT_SECRET)
   }catch(err){
    console.log("auth middleware token verification error:",err.message)
    return res.status(401).json({msg:"Invalid or expired token. Log in again and use the returned token."})
   }

  try{
   const user=await User.findById(decoded.userId)

   if(!user){
      return res.status(401).json({
        msg:"user not found"
      })
   }

   req.user=user
   next()


    }catch(err){
      console.log("auth middleware user lookup error:",err.message)

      return res.status(500).json({
        msg:"Authentication failed"
      })
    }
}