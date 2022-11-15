const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, 
    error => {
    if(error) throw error;
    console.log('connected to MongoDB')
})