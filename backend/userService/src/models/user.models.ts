import mongoose, { Document } from "mongoose";
export interface UserInterface extends Document{
    name:string;
    email:string,
    profilePicture:string;
}


const userSchema=new mongoose.Schema<UserInterface>(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true
        },
        profilePicture:{
            type:String,
            default:null
        }
    },
    {
        timestamps:true
    }
);


export const User=mongoose.model<UserInterface>('User',userSchema);

export default User;