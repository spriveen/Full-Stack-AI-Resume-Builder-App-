import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const generateToken = ()=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET, {expiresIn: '7d'})
    return token
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
    const token = generateToken(userId._id)
    newUser.password = undefined;

    return res.status(201).json({message:'User created sucessfully', token,
      user: newUser})

     } catch (error) {
        return res.status(400).json({message: error.message})
    }
}