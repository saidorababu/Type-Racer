import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mysql from 'mysql'
import multer from 'multer'
import path from 'path'
import { Server } from 'socket.io'


dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(cors({
    origin:["http://localhost:3000","http://10.2.64.224:3000"],
    credentials:true
}))

const PORT = process.env.PORT || 4000

const server = app.listen(PORT,()=>{
    console.log("App is Running on Port 4000");
})

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    port:3307,
    database:"typeracer"
})
db.connect((err)=>{
    if(err){
        console.log("Error in connecting to database")
        console.error(err.stack)
        return;
    }
    console.log("Connected to database with id as "+db.threadId );
})

// register a user
app.post('/signup', (req, res)=>{
    const {userData} = req.body;
    const {username, email, password, dateofbirth, place} = userData;
    console.log("123");
    bcrypt.hash(password,10,(err,hash)=>{
        if(err){
            res.status(500).json({error:"error in hashing the password!"});
        }else{
            const id = 0
            const sqlQuery = 'INSERT into users (username, email, password,dateofbirth,place) values (?,?,?,?,?);';
            db.query(sqlQuery,[username,email,hash,dateofbirth,place],(err,result)=>{
                if(err){
                    res.status(500).json({error:"error in registering the user"});
                }else{
                    res.status(200).json({data:"successfully registered",user:username});
                }
            })
        }
    }) 
})

//Authentication
app.post('/login',async (req,res)=>{
    const {email,password} = req.body;
    const sqlQuery = "Select * from users where email = ?";
    db.query(sqlQuery,[email,password],async (err,results)=>{
        if(err){
            res.status(500).json({error:"invalid email"});
        }else{
            if(results.length>0){
                const user = results[0];
                bcrypt.compare(password,user.password,(err,match)=>{
                    if(!match){
                        res.status(401).json({error:"invalid password"});
                    }else{
                        const token = jwt.sign({userId : user.id}, 'my_secret_key',{expiresIn:'2h'});
                        res.status(200).json({token,user});
                    }
                })
            }else{
                res.status(401).json({error:"user not found"});
            }
        }
    });
});
// Define the routes
app.get("/api/words", async (req, res) => {
    const query = "select content from texts where text_id = 2 limit 10";
    db.query(query,(err,results)=>{
        if(err){
            res.status(500).json({error:"Error retrieving words"});
        }else{
            res.status(200).json({data:results[0]});
        }
    });
});

app.get("/api/scores", async (req, res) => {
  // Get all scores from the database, sorted by wpm in descending order
  try {
    const scores = await Score.find().sort({ wpm: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/scores", async (req, res) => {
  // Add a new score to the database
  try {
    const { score } = req.body;
    const wpm = Math.round((score / 60) * 60);
    const newScore = new Score({ score, wpm });
    await newScore.save();
    res.json({ message: "Score added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle typing data from the client-side
io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} connected`);

    // Join a room 
    socket.on("joinRoom", (room) => {
        console.log(`Socket ${socket.id} joined room ${room}`);
        socket.join(room);
    });
    // Listen for typing data from the client-side
    socket.on("typingData", (data) => {
        console.log(`Socket ${socket.id} sent typing data: ${data}`);
        const { room, words } = data;
        console.log(words);
        // Broadcast the typing data to all clients in the same room
        io.to(room).emit("updateTypingData", words);
        socket.to(room).emit("updateTypingData", words);
    });
    

// Listen for progress updates from the client-side
    // socket.on("progressUpdate", (data) => {
    //     console.log(`Socket ${socket.id} sent progress update: ${data}`);
        
    //     const { progress, email, room } = data;
    //     const sqlQuery = "select * from progress where email = ? and room_id = ?";
    //     db.query(sqlQuery,[email,room],(err,result)=>{
    //         if(err){
    //             res.status(500).json({error:"error in getting progress"});
    //         }else{
    //             if(result.length>0){
    //                 const sqlQuery = "update progress set progress = ? where email = ? and room_id = ?";
    //                 db.query(sqlQuery,[progress,email,room],(err,result)=>{
    //                     if(err){
    //                         res.status(500).json({error:"error in updating progress"});
    //                     }else{
    //                         const sqlQuery = "SELECT * FROM progress WHERE room_id = ?";
    //                         db.query(sqlQuery, [room], (err, result) => {
    //                             if (err) {
    //                                 console.error(err);
    //                             } else {
    //                                 // Broadcast the progress update to all clients in the same room
    //                                 io.to(room).emit("updateProgress", result);
    //                             }
    //                         });
    //                         res.status(200).json({data:"progress updated successfully",email:email});
    //                     }
    //                 })
    //             }else{
    //                 const sqlQuery = "INSERT into progress (room_id, progress, email) values (?,?,?);";
    //                 db.query(sqlQuery,[room,progress,email],(err,result)=>{
    //                     if(err){
    //                         res.status(500).json({error:"error in adding progress"});
    //                     }else{
    //                         const sqlQuery = "SELECT * FROM progress WHERE room_id = ?";
    //                         db.query(sqlQuery, [room], (err, result) => {
    //                             if (err) {
    //                                 console.error(err);
    //                             } else {
    //                                 // Broadcast the progress update to all clients in the same room
    //                                 io.to(room).emit("updateProgress", result);
    //                             }
    //                         });
    //                         res.status(200).json({data:"progress added successfully",email:email});
    //                     }
    //                 })
    //             }
    //         }
    //     })
    // });

});

app.get("/api/progress/:room_id", async (req, res) => {
    // Get all progress from the database
    
    try {
        const { room_id } = req.params;
        const sqlQuery = "SELECT username,progress FROM progress WHERE room_id = ?";
        db.query(sqlQuery, [room_id], (err, result) => {
            if (err) {
                res.status(500).json({ error: "Error in getting progress" });
            } else {
                console.log(result);
                res.status(200).json({ data: result });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.post("/api/progress", async (req, res) => {
    const { progress, email, room, username } = req.body;
    const sqlQuery = "select * from progress where email = ? and room_id = ?";
    db.query(sqlQuery,[email,room],(err,result)=>{
        if(err){
            res.status(500).json({error:"error in getting progress"});
        }else{
            if(result.length>0){
                const sqlQuery = "update progress set progress = ?,username = ? where email = ? and room_id = ?";
                db.query(sqlQuery,[progress,username,email,room],(err,result)=>{
                    if(err){
                        res.status(500).json({error:"error in updating progress"});
                    }else{
                        res.status(200).json({data:"progress updated successfully",email:email});
                    }
                })
            }else{
                const sqlQuery = "INSERT into progress (room_id, progress, email) values (?,?,?);";
                db.query(sqlQuery,[room,progress,email],(err,result)=>{
                    if(err){
                        res.status(500).json({error:"error in adding progress"});
                    }else{
                        res.status(200).json({data:"progress added successfully",email:email});
                    }
                })
            }
        }
    })
    
})
app.get("/api/deleteroom/:room_id", async (req, res) => {
    try {
        const { room_id } = req.params;
        const sqlQuery = "delete from progress where room_id = ?";
        db.query(sqlQuery, [room_id], (err, result) => {
            if (err) {
                res.status(500).json({ error: "Error in deleting progress" });
            } else {
                console.log(result);
                res.status(200).json({ data: result });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})



