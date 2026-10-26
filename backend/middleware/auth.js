import jwt from "jsonwebtoken"

export const auth = (req, res, next)=>{
    const header = req.headers.authorization
    if(!header){
        res.status(401).json({error : "Provide Token"})
        console.error("Provide Token")
    }
    const token = header.split(" ")[1]
    try{
        const  payload= jwt.verify(token, process.env.JWT_TOKEN)
        req.user = payload 
        next()
    }catch(e){
        res.status(401).json({error: "Invalid token"})
    }
    
}

export default auth 