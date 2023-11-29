const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors')
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5003;
const router = require('./src/router/route')
const { ObjectId } = require('mongodb');


const connectDB = require('./src/db/ConnectDB')
const Class = require('./src/models/ClassModel')
const feedBack = require('./src/models/FeedBackModel')
const User = require('./src/models/UserModel')
const allClass = require('./src/models/AllClassModel');
const classCart = require('./src/models/ClassCartModel')
const payment = require('./src/models/PaymentInfoModel')
const Enroll = require('./src/models/EnrollModel');
const AllEnrolled = require('./src/models/AllEnroledModel')
const TeachReq = require('./src/models/TeacherModel');
const { query } = require('express');
const AddClass = require('./src/models/AddClassModel')
//middleware
app.use(express.json());
app.use(cors());


const corsOptions = {
    origin: ['http://localhost:5003'],
    credentials: true,
    optionSuccessStatus: 200
}


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
    const verifyAdmin = async (req, res, next) => {
        const email = req.decoded.email;
        const query = { email: email };
        try {
            const user = await User.findOne(query)
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
        } catch (error) {
            res.send({ message: error })
        }
        next();
    }
    //admin api
    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;

        try {
            const result = await User.updateOne({ _id: id }, { $set: { role: 'admin' } });
            res.send(result)
        } catch (error) {
            res.status(500).send({ error: 'Internal Server Error' });
        }
    });
    //checkadmin api
    app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email;
        // console.log(email)
        const query = { email: email }
        try {
            const user = await User.findOne(query)
            let admin = false;
            if (user) {
                admin = user.role === 'admin'
            }
            res.send({ admin })
        } catch (error) {
            res.send({ error })
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
    //user on email
    app.get('/user/:email', async (req, res) => {
        const data = req.params;
        console.log(data.email)
        const query = { email: data.email }
        try {
            const result = await User.findOne(query);
            res.send(result)
        } catch (error) {
            res.send({ error })
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

    //teacherrequest
    app.post('/teacherrequest', async (req, res) => {
        const teacherInfo = req.body;
        try {
            const checkDouble = await TeachReq.findOne(teacherInfo);
            if (checkDouble) {
                return res.send({ message: ' Request already sent' })
            }
            const createTeacherReq = new TeachReq(teacherInfo);
            const saveTeacherReq = createTeacherReq.save();
            if (saveTeacherReq) {
                res.send({ message: 'succeed' })
            }
        } catch (error) {
            res.send({ error })
        }
    })
    app.get('/teacherrequest', async (req, res) => {
        const result = await TeachReq.find();
        res.send(result)
    })
    app.get('/teacherrequest/:email', async (req, res) => {
        const email = req.params.email;
        const filter = {email: email}
        const result = await TeachReq.findOne(filter);
        res.json(result)
    })
    app.patch('/teacherrequest/:id', async(req,res)=>{
        const id = req.params.id;
        const updates = req.body;
        console.log(id, updates)
        try{
           const teacherRequest = await TeachReq.findById(id);
        //    console.log('Teacher Request:', teacherRequest);
           if(!teacherRequest){
            return res.send({message: 'Teacher request was not found'})
           }
           Object.keys(updates).forEach((field)=>{
            teacherRequest[field] = updates[field]
           })
           const updatedRequest = await teacherRequest.save();
         res.json(updatedRequest)
        //    console.log(teacherRequest)
        }catch(error){
            res.send({error})
        }
    })
    app.patch('/updateuser/:email', async(req,res)=>{
        const email = req.params.email;
        const updates = req.body;
        // console.log(email, updates)
        try{
            const findUser = await User.findOne({email: email})
            console.log(findUser)
            const userId = findUser._id;
            console.log(userId)
            const updateUser = await User.findByIdAndUpdate(
                userId,
                {role: 'teacher'},
                {upsert: true, new: true}
            )
            console.log(updateUser)
           res.send({message: 'User Role Updated'})
         
        }catch(error){
            res.send({error})
        }
    })
    //add class
    app.post('/classes', async(req,res)=>{
        const classInfo = req.body;
        // console.log(classInfo);
        try{
            const checkDouble = await AddClass.findOne(classInfo)
            if(checkDouble){
                return res.send({message:'Data is already in Database'})
            }
            const createClass = new AddClass(classInfo);
            const saveClass = await createClass.save();
            if(!saveClass){
                res.send({message: 'class not added'})
            }else(
                res.send({message:'succeed'})
            )
        }catch(error){
            res.send({error})
        }
    })
    app.get('/classes', async (req, res) => {
        try {
            const classes = await Class.find({});
            res.send(classes)
        } catch (error) {
            res.send(error)
        }
    })
    app.get('/classes/:email', async(req,res)=>{
        const email = req.params.email;
        // console.log(email)
        try{
            const user = await User.findOne({ email: req.params.email });
            // console.log(user)
            const classes = await Class.find({ userId: user._id });
            // console.log(classes)
            res.send(classes)
             
        }catch(error){
            res.send({error})
        }
    })
    app.delete('/classes/:id', async(req,res)=>{
        const classId = req.params.id;
        // console.log(classId)
        try{
            const deleteClass = await Class.findByIdAndDelete(classId);

            if (!deleteClass) {
                return res.send({message: 'Class Not found'})
              }
            res.send({message: 'succeed'})
        }catch(error){
            res.send({error})
        }
    })
    //allclass api 
    app.get('/allclasses', async (req, res) => {
        try {
            const allClasses = await Class.find();
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
    //classcart
    app.post('/classcart', async (req, res) => {
        const cartInfo = req.body;
        try {
            const cartCheck = await classCart.findOne(cartInfo);
            if (cartCheck) {
                return res.status(400).json({ error: 'Data is already in database' })
            }
            const createClassCart = new classCart(cartInfo)
            const insertIntoDb = await createClassCart.save();
            res.json({ message: 'Cart data saved to database' })
        } catch (error) {
            res.send({ error })
        }
    })
    app.get('/classcart', async (req, res) => {
        const email = req.query.email;
        const query = { email: email }
        try {
            const result = await classCart.findOne(query);
            if (!result) {
                return res.json({});
            }
            res.send(result)
        } catch (error) {
            res.send({ error })
        }
    })
    //getpaymentedclass
    app.post('/myenrolls', async (req, res) => {
        const enrollsInfo = req.body;
        // console.log(enrollsInfo)
        try {
            const checkEnrolls = await Enroll.findOne({
                email: enrollsInfo.email,
                enrolledClassid: enrollsInfo.enrolledClassid
            })
            if (checkEnrolls) {
                return res.status(400).json({ error: "This Class is already in Enrollment" })
            }
            const createEnrollCollection = new Enroll(enrollsInfo);
            const sentEnrollstoDb = createEnrollCollection.save();
            res.json(sentEnrollstoDb)
        } catch (error) {
            res.send({ error })
        }
    })
    app.get('/myenrolls/:email', async (req, res) => {
        const email = req.params.email;
        // console.log(email)
        try {
            const query = { email: email };
            const paymentInfo = await Enroll.findOne(query)
            const filter = { _id: paymentInfo.enrolledClassid }
            // console.log(filter)
            const enrolledClass = await allClass.findOne(filter)
            res.send(enrolledClass)
            Enroll.deleteOne({ _id: paymentInfo.enrolledClassid })
                .then(res => {
                    if (!res.deletedCount) {
                        console.error('Failed to Delete')
                    }
                })
        } catch (error) {
            res.send({ error })
        }

    })
    app.post('/allenrolled', async (req, res) => {
        const classInfo = req.body;
        try {
            // console.log(classInfo)
            const checkDouble = await AllEnrolled.findOne(classInfo);
            if (checkDouble) {
                return res.send({ message: 'Data is already in database' })
            }
            const allEnrollements = new AllEnrolled(classInfo);
            const saveAllEnrolled = allEnrollements.save();
            if (!saveAllEnrolled) {
                console.log('failed')
                res.send({ message: 'failed to store data' })
            }
            const deleteClass = await Enroll.deleteOne()
            res.send('allenrolled data save in db')
        } catch (error) {
            res.send({ error })
        }
    })
    app.get('/allenrolled', async (req, res) => {
        const result = await AllEnrolled.find();
        res.send(result)
    })
    app.get('/allenrolled/:email', async (req, res) => {
        const email = req.params.email;
        try {
            const result = await AllEnrolled.find({ email: email });
            res.send(result)
        } catch (err) {
            res.send({ err })
        }
    })
    app.post('/feedback', async (req, res) => {
        const feedBack = req.body;
        const createFeedBack = new feedBack(feedBack);
        const saveFeedBack = createFeedBack.save();
        res.send({ message: 'feedback received' })
    })
    app.get('/feedback', async (req, res) => {
        try {
            const feedback = await feedBack.find({});
            res.send(feedback)
        } catch (error) {
            res.send(error)
        }
    })

    //strpe payment
    app.post('/create-payment-intent', async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
        // console.log(amount, 'amount inside the intent')

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
        });

        // console.log(paymentIntent.client_secret)
        res.send({
            clientSecret: paymentIntent.client_secret
        })
    });
    //paymetn
    app.post('/payments', async (req, res) => {
        const paymentInfo = req.body;
        try {
            const createPaymentInfo = new payment(paymentInfo);
            const savePaymentInfo = await createPaymentInfo.save();
            const query = { classId: paymentInfo.classCartId }
            const deleteClass = await classCart.deleteOne(query);

            res.send({ message: 'Payment Information saved to Db' })
        } catch (error) {
            res.send({ error })
        }
    })
    //afterpaymentupdateclassdata
    app.patch('/updateclassdata/:id', async (req, res) => {
        const classId = req.params.id;
        try {
            const updateCladdData = await allClass.updateOne(
                { _id: classId },
                { $inc: { total_enrollment: 1 } },
            )
            if (updateCladdData.nModified > 0) {
                res.json({ message: "Data Updated Successfully" })
            } else {
                res.status(404).json({ error: 'Class not updated' })
            }
        } catch (error) {
            res.send({ error })
        }
    })
    app.get('/', (req, res) => {
        res.send('Skill Nest is running successfuly')
    })
    app.listen(port, () => {
        console.log('skillnest is running on', port)
    })
})








