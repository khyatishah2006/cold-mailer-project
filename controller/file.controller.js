import cloudinary from "../config/cloud.config.js"
import File from "../model/file.model.js"
import User from "../model/auth.model.js"

export const uploadFile = async(req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                sucess : false,
                message : "File is required"
            })
        }
        const {filename} = req.body
        if(!filename){
            return res.status(400).json({
            sucess : false,
                message : "Filename is required"
            })
        }
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "files",
                    resource_type : "auto"
                },
                    (error, result) => {
                        if(error) {
                            return reject(error)
                        } else {
                            return resolve(result)
                        }
                    }
            )
            stream.end(req.file.buffer)
        })
        const file = await File.create({
            filename,
            fileURL : result.secure_url,
            createdBy : req.user._id
        })
        await User.findByIdAndUpdate(req.user_id,{

                  $push : {
                files : file._id
            }
    })
    return res.status(201).json({
        sucess : true,
        message : "File uploaded successfully",
        file
    })
    } catch (error) {
        console.log("file upload error:", error.message)
        return res.status(500).json({
        sucess : false,
        message : "Internal Server Error",
    })
}
}