const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const fs = require('fs-extra');
const fileUpload= require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhghr.mongodb.net/volunteerNetwork?retryWrites=true&w=majority`;
const app = express();
const port = 4000;
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('Orders'));
app.use(fileUpload())


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.connect(err => {
  const orderCollection = client.db("creative-agency").collection("Orders");
  const reviewCollection = client.db("creative-agency").collection("reviews");
  const serviceCollection = client.db("creative-agency").collection("services");
  const adminCollection = client.db("creative-agency").collection("admins");

  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const projectName = req.body.projectName;
    const projectDetails = req.body.projectDetails;
    const filePath = `${__dirname}/Orders/${file.name}`;
    file.mv(filePath,err=>{
      if(err){
        console.log(err);
        res.status(500).send({msg:"Failed to Upload image"})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image ={
        contentType: req.files.file.mimetype,
        size : req.files.file.size,
        img : Buffer(encImg, 'base64')
      };
      orderCollection.insertOne({name,email,projectName,projectDetails,image})
      .then(result=>{
        fs.remove(filePath,error=>{
          if(error){
            console.log(error)
            res.status(500).send({msg:"Failed to Upload an image"})
          }
            res.send(result);
        })
      })   
    })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({
        email: req.query.email
      })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })


  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const serviceTitle = req.body.serviceTitle;
    const description = req.body.description;
    const serviceName = req.body.serviceName;
    const filePath = `${__dirname}/Services/${file.name}`;
    file.mv(filePath,err=>{
      if(err){
        console.log(err);
        res.status(500).send({msg:"Failed to Upload image"})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image ={
        contentType: req.files.file.mimetype,
        size : req.files.file.size,
        img : Buffer(encImg, 'base64')
      };
      serviceCollection.insertOne({serviceTitle,description,image,serviceName})
      .then(result=>{
        fs.remove(filePath,error=>{
          if(error){
            console.log(error)
            res.status(500).send({msg:"Failed to Upload an image"})
          }
            res.send(result);
        })
      })   
    })
  })


  app.get('/services', (req, res) => {
    serviceCollection.find({
        email: req.query.email
      })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })

  app.get('/allOrders', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

     app.post("/addReviews", (req, res) => {
    const Product = req.body;
    reviewCollection.insertOne(Product)
      .then(result => {
        console.log("data added Successfully");

      })
  })

    app.get('/reviews', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post("/addAdmin", (req, res) => {
    const Product = req.body;
    adminCollection.insertOne(Product)
      .then(result => {
        console.log("data added Successfully");

      })
  })

  app.post('/isAdmin',(req,res)=>{
    const email = req.body.email;
    adminCollection.find({ email: email})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  app.get('/', (req, res) => {

    res.send('welcome to new database')

  })
});


app.listen(process.env.PORT || port);