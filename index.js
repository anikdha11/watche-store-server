const express = require('express')
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config()
const objectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gt16r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      const database = client.db("watch_store");
      const productsCollection = database.collection("watchproducts");
      const orderCollection = database.collection("order");
      const reviewCollection = database.collection("review")
      const usersCollection = database.collection("users")
      
    //Get Api
    app.get('/products', async (req, res) => {
        const cursor = productsCollection.find({});
        const product = await cursor.toArray();
        res.send(product);
    })

    app.get('/users', async (req, res) => {
        const cursor = usersCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
    })

    //Get Review Api

    app.get('/review', async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
  })

    //Get single Api
    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: objectId(id) };
        const singleProduct = await productsCollection.findOne(query);
        res.json(singleProduct);

    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })
    //post api

    app.post('/order', async(req,res)=>{
        const order = req.body;
       const ordered = await orderCollection.insertOne(order)
       res.json(ordered)
    })

    app.post ('/review',async(req,res)=>{
      const review = req.body;
      const personReview = await reviewCollection.insertOne(review);
      res.json(personReview);
    })
    app.post ('/users',async(req,res)=>{
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.json(result);
    })


    //Get Order
    app.get('/order',async(req,res)=>{

      const email = req.query.email;
      const query = {email: email};
      const cursor = orderCollection.find(query)
      const mineOrder = await cursor.toArray();
      res.json(mineOrder)
    })

      //Delete Api
      app.delete('/order/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id:objectId(id)};
        const deleteOne = await orderCollection.deleteOne(query);
        res.json(deleteOne);
        
    })

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });

  app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
  })
    
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('watches store running okk')
})

app.listen(port, () => {
  console.log('server is running at port', port)
})
