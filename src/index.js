import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/dbConnnection.js';

dotenv.config({
    path: '.env'
})

const port = process.env.PORT || 3000

connectDB()
  .then(() =>{
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`)
    })
  })
  .catch (() =>{
    console.error("MongoDB cannot connect")
    process.exit(1)
  })