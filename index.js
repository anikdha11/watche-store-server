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
// console.log(uri)

async function run() {
    try {
      await client.connect();
      const database = client.db("watch_store");
      const productsCollection = database.collection("watchproducts");
      const orderCollection = database.collection("order");
      
    //Get Api
    app.get('/products', async (req, res) => {
        const cursor = productsCollection.find({});
        const product = await cursor.toArray();
        res.send(product);
    })
    //Get single Api
    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: objectId(id) };
        const singleProduct = await productsCollection.findOne(query);
        res.json(singleProduct);

    })
    //post api

    app.post('/order', async(req,res)=>{
        const order = req.body;
       const ordered = await orderCollection.insertOne(order)
       res.json(ordered)
    })

    //Get Order
    app.get('/order',async(req,res)=>{
        const cursor = orderCollection.find({});
        const order = await cursor.toArray();
        res.send(order);
    })

      //Delete Api
      app.delete('/order/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id:objectId(id)};
        const deleteOne = await orderCollection.deleteOne(query);
        res.json(deleteOne);
        
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
