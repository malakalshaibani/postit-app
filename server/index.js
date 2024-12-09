import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./Models/UserModel.js";
import PostModel from "./Models/PostModel.js";
import * as dotenv from "dotenv"
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";


const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

// const URI =`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@postitcluster.b11ne.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&appName=PostITCluster`;
const URI =`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@postitcluster.vi4jl.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&appName=PostITCluster`
// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});
// Convert the URL of the current module to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the current file path
const __dirname = dirname(__filename);

// Set up middleware to serve static files from the 'uploads' directory
// Requests to '/uploads' will serve files from the local 'uploads' folder
app.use("/uploads", express.static(__dirname + "/uploads"));

// Create multer instance
const upload = multer({ storage: storage });


mongoose.connect(URI);
app.listen(process.env.PORT, () => {
   console.log("You are connected");
});

//GET API - getPost
app.get("/getPosts", async (req, res) => {
  try {
    // Fetch all posts from the "PostModel" collection, sorted by createdAt in descending order
    const posts = await PostModel.find({}).sort({ createdAt: -1 });

    const countPost = await PostModel.countDocuments({});

    res.send({ posts: posts, count: countPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});


//POST API - savePost
app.post("/savePost", async (req, res) => {
    try {
      const postMsg = req.body.postMsg;
      const email = req.body.email;
  
      const post = new PostModel({
        postMsg: postMsg,
        email: email,
      });
  
      await post.save();
      res.send({ post: post, msg: "Added." });
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  });

app.post("/registerUser", async(req, res) => {
  try{
    const user = new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })

    await user.save();
    res.send({user:user, msg:"Document saved successfully"})

  }
  catch(error) {
    console.error(error);
    res.status(500).json({error:"An unexpected error occurred"})

  }


})

//Express route for login

app.post("/login", async (req, res) => { 
  try { 
    const { email, password } = req.body;
  
    const user = await UserModel.findOne({ email: email });

    if (!user) { 
      res.status(500).send({ msg: " Couldn't find the user" });
      
    }
    else if (user.password !== password) {
      res.status(500).json({ msg: "Password is incorrect" });
      
    }
    else {
      res.send({user: user,msg:"Authentication is  successfull"})
    }
  }
  catch (error) { 
    res.status(500).json({error:"An unexpected error occurred"})
  }
})

app.post("/logout", async (req, res) => {
  res.send({ msg: "logout successful" })
 })

app.put("/updateUserProfile/:email/", async (req, res) => {
  //Retrieve the value from the route
  const email = req.params.email;
  //Retrieve the values from the request body.
  const name = req.body.name;
  const password = req.body.password;

  try {
    // Search for the user that will be updated using the findOne method
    const userToUpdate = await UserModel.findOne({ email: email });

    // Check if the user was found
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if a file was uploaded and get the filename
    let profilePic = null;
    if (req.file) {
      profilePic = req.file.filename; // Filename of uploaded file
      if (userToUpdate.profilePic) {
        const oldFilePath = path.join(
          __dirname,
          "uploads",
          userToUpdate.profilePic
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("Old file deleted successfully");
          }
        });
        userToUpdate.profilePic = profilePic; // Set new profile picture path
      }
    } else {
      console.log("No file uploaded");
    }


    // Update the user's name
    userToUpdate.name = name;
            //if the user changed the password, change the password in the Db to the new hashed password
            if (password !== userToUpdate.password) {
              const hashedpassword = await bcrypt.hash(password, 10);
              userToUpdate.password = hashedpassword;
            } else {
              //if the user did not change the password
              userToUpdate.password = password;
            }
        
            // Save the updated user
            await userToUpdate.save(); // Make sure to save the changes
        
            // Return the updated user as a response
            res.send({ user: userToUpdate, msg: "Updated." });
    

  } catch (err) {
    // Handle errors, including database or validation issues
    res.status(500).json({ error: err.message }); // Send a more descriptive error message
  }
});


