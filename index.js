const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors')
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5003;
const router = require('./src/router/route')
const connectDB = require('./src/db/ConnectDB')
const Class = require('./src/models/ClassModel')
const feedBack = require('./src/models/FeedBackModel')
const User = require('./src/models/UserModel')
const allClass = require('./src/models/AllClassModel')
//middleware
app.use(express.json());
app.use(cors());

connectDB().then(()=>{
    
    app.post('/jwt', async(req,res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKENT, {expiresIn: '1h'})
        res.send({token})
    })
    app.get('/users', async(req,res)=>{
        try{
            const users = await User.find({});
            res.send(users)
        }catch(error){
            console.log(error)
        }
    })
    app.post('/user', async (req, res) => {
        try {
            const userInfo = req.body;
            const query = {email : userInfo.email}
            const userCheck = await User.findOne(query)
            if(userCheck){
                return res.json({message:'User is already in database'})
            }
            const createUser = new User(userInfo);
            const addUserInDb = await createUser.save();
             res.json({ message: 'User created successfully', user: addUserInDb });
           
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    app.get('/classes', async(req,res)=>{
        try{
            const classes = await Class.find({});
            res.send(classes)
        }catch(error){
            res.send(error)
        }
    })
    //allclass api 
    app.get('/allclasses', async(req,res)=>{
        try{
            const allClasses = await allClass.find();
            res.send(allClasses)
        }catch(error){
            console.log(error)
        }
    })
    //specific class api
    app.get('/allclasses/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
    })
    app.get('/feedback', async(req,res)=>{
        try{
            const feedback = await feedBack.find({});
            res.send(feedback)
        }catch(error){
            res.send(error)
        }
    })
    

    app.get('/', (req,res)=>{
        res.send('Skill Nest is running successfuly')
    })
    app.listen(port, ()=>{
        console.log('skillnest is running on', port)
    })
})








