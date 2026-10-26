import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
       username: {type: String, required: true, unique: true},
       password: {type: String, required: true},
    },
    {timestamps: true},
)

const UserDetails = mongoose.model('user', userSchema) 

export default UserDetails