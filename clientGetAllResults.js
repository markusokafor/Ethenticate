const axios = require('axios')

axios.get('http://localhost:3000/GetAllResults').then( result => {
    console.log("All Attempts : ",result.data);
}).catch(err => {
    console.log(err);
})