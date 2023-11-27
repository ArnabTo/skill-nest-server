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
const allClass = require('./src/models/AllClassModel');
const { ObjectId } = require('mongodb');
//middleware
app.use(express.json());
app.use(cors());

connectDB().then(() => {
    //jwt token generate
    app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKENT, { expiresIn: '1h' })
        res.send({ token })
    })
    //middleware
    const verifyToken = (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401).send({ message: 'Unauthorized access' })
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKENT, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: 'Unauthorized access' })
            }
            req.decoded = decoded;
            next();
        })
    }
    const verifyAdmin = async(req,res,next)=>{
          const email = req.decoded.email;
          const query = {email: email};
          try{
            const user = await User.findOne(query)
            const isAdmin = user?.role === 'admin';
            if(!isAdmin){
             return res.status(403).send({message: 'Forbidden Access'})
            }
          }catch(error){
            res.send({message: error})
          }
          next();
    }
    //admin api
    app.patch('/users/admin/:id', verifyToken, verifyAdmin , async (req, res) => {
        const id = req.params.id;
      
        try {
          const result = await User.updateOne({ _id: id }, { $set: { role: 'admin' } });
          res.send(result)
        } catch (error) {
          res.status(500).send({ error: 'Internal Server Error' });
        }
      });
      //checkadmin api
      app.get('/users/admin/:email', async(req,res)=>{
        const email = req.params.email;
        console.log(email)
        const query = {email: email}
         try{
            const user = await User.findOne(query) 
            let admin = false;
            if(user){
                admin = user.role === 'admin'
            }
            res.send({admin})
         }catch(error){
            res.send({error})
         }
      })
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
        try {
            const users = await User.find({});
            res.send(users)
        } catch (error) {
            console.log(error)
        }
    })
    app.post('/user', async (req, res) => {
        try {
            const userInfo = req.body;
            const query = { email: userInfo.email }
            const userCheck = await User.findOne(query)
            if (userCheck) {
                return res.json({ message: 'User is already in database' })
            }
            const createUser = new User(userInfo);
            const addUserInDb = await createUser.save();
            res.json({ message: 'User created successfully', user: addUserInDb });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/classes', async (req, res) => {
        try {
            const classes = await Class.find({});
            res.send(classes)
        } catch (error) {
            res.send(error)
        }
    })
    //allclass api 
    app.get('/allclasses', async (req, res) => {
        try {
            const allClasses = await allClass.find();
            res.send(allClasses)
        } catch (error) {
            console.log(error)
        }
    })
    //specific class api
    app.get('/allclasses/:id', async (req, res) => {
        const id = req.params.id;
        // console.log(id)
        const query = { _id: new ObjectId(id) }
        const result = await allClass.findOne(query);
        res.send(result)
    })
    app.get('/feedback', async (req, res) => {
        try {
            const feedback = await feedBack.find({});
            res.send(feedback)
        } catch (error) {
            res.send(error)
        }
    })


    app.get('/', (req, res) => {
        res.send('Skill Nest is running successfuly')
    })
    app.listen(port, () => {
        console.log('skillnest is running on', port)
    })
})








