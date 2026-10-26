import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
    {
        sender : {type: String, required: true},
        receiver: {type: String, required: true},
        text : {type: String, required: true}          
    },
    {timestamps: true}
)

const messageDetails = mongoose.model("Message", messageSchema)
export default messageDetails