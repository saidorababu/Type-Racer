import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mysql from 'mysql'
import multer from 'multer'
import path from 'path'

dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(cors({
    origin:["http://localhost:3000"],
    credentials:true
}))

const PORT = process.env.PORT || 4000

app.listen(PORT,()=>{
    console.log("App is Running on Port 4000");
})

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    port:3307,
    database:"cloud management database"
})
console.log("12");
db.connect((err)=>{
    if(err){
        console.log("Error in connecting to database")
        console.error(err)
        return;
    }
    console.log("Connected to database with id as "+db.threadId );
})

// register a user
app.post('/signup', (req, res)=>{
    const {userData} = req.body;
    const {username, email, password, dateofbirth, place} = userData;
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
            res.status(500).json({error:"Error retrieving user"});
        }else{
            if(results.length>0){
                const user = results[0];
                bcrypt.compare(password,user.password,(err,match)=>{
                    if(err){
                        res.status(401).json({error:"Authentication Failed"});
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
  // Get 10 random words from the database
  try {
    const words = await Word.aggregate([{ $sample: { size: 10 } }]);
    res.json(words.map((word) => word.word));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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