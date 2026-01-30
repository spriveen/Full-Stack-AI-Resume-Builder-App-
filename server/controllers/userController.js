import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";


const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}


// controller for user registration
//  POST: /api/users/registration
export const  registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // check if requred fields are present
        if(!name || !email || !password){
            return res.status(400).json({message:'Missing required fields'})
        }
        //   check if user already exisits
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message:'User already exists'})
        }


        // craete new user
   const hashedPassword = await bcrypt.hash(password, 10)
   const newUser = await User.create({
       name,email,password:hashedPassword
       })

    //    return sucess message
    const token = generateToken(newUser._id)
    newUser.password = undefined;

    return res.status(201).json({message:'User created sucessfully', token,
      user: newUser})

     } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

//  controller for user login
// post :/api/user/login
export const  loginUser = async (req, res) => {
    try {
        const { email, password} = req.body;

       
        //   check if user  exisits
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:'Invalid email or password'})
        }
      //   check if password is correct  
         if(!user.comparePassword(password)){
         return res.status(400).json({message:'Invalid email or password'})
      }

    //   return success message
const token = generateToken(user._id)
    user.password = undefined;

    return res.status(200).json({message:'Login sucessfully', token, user})

     } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for getting userby id
// GET: /api/user/data

export const  getUserById = async (req, res) => {
    try {
        
      const userId = req.userId;

    //   check if user exists
  const user = await User.findById(userId)
  if(!user){
    return res.status(404).json({message: "User not found"})
  }

   //   return user
   user.password = undefined;
return res.status(200).json( {user})

     } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for getting user resumes
// GET: /api/resumes
export const getUserResumes = async (req, res) =>{
try {
   const  userId = req.userId;
   
 //    return user resume
 const resumes = await Resume.find({ userId })
 return res.status(200).json({resumes})


} catch (error) {
    return res.status(400).json({message: error.message})  
}
}
