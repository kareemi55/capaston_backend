const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Parse= require('parse/node')
const crypto = require('crypto')
const bodyParser = require('body-parser');
const {PARSE_APP_ID, PARSE_JAVASCRIPT_KEY,  REST_API_KEY} = require('./config')
// import ParseCloud from 'parse-server/lib/cloud-code/Parse.Cloud'

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use(morgan("tiny"))
app.use(cors())


Parse.initialize(PARSE_APP_ID, PARSE_JAVASCRIPT_KEY)
Parse.initialize(PARSE_APP_ID, PARSE_JAVASCRIPT_KEY,  REST_API_KEY)
Parse.serverURL = "https://parseapi.back4app.com"
// Parse.masterKey =  process.env.MASTER_KEY;

app.post('/register', async (req, res) => {
  let user = new Parse.User(req.body)
  console.log('user: ', user);
  console.log('req.body: ', req.body);

  try {
      await user.signUp()
      res.status(201)    
      res.send({"user" : user})
  } catch (error) {
      res.status(400)
      res.send({"error" : "Failed to create user: " + error })
  }
})

////////////////////////////////////////
app.post('/createUser', async (req, res) => {
  let { username, email, password, country, city, language, profession, skills, company, role, description  } = req.body;
  var User = Parse.Object.extend("User");
  const user = new User();
    user.set('username', username);
    user.set('email',  email);
    user.set('password', password);
    user.set('country', country);
    user.set('city', city);
    user.set('language', language);
    user.set('profession', profession);
    user.set('skills', skills);
    user.set('company', company);
    user.set('role', role);
    user.set('description', description);
    try {
      let userResult = await user.signUp();
      console.log('User signed up', userResult);
      res.send("created user successfully")
    } catch (error) {
      console.error('Error while signing up user', error);
    }
  })

  // get api
  app.get('/getUser', async (req, res) => {
    const query = new Parse.Query("User");
        try {
        const userdata = await query.find();
        res.send(userdata)
        console.log(userdata)
        } catch (error) {
          res.send(error)
        }
    })

    // update
// app.patch('update/user/:objectId', (req, res) => {
//   const MyCustomClass = Parse.Object.extend('User');
//   const query = new Parse.Query(MyCustomClass);

// // query.equalTo("objectId", "<object-ID-here>");
// console.log(req)
//   query.equalTo("objectId", objectId);
//   query.find({ MASTER_KE: true}).then((results) => {
//   console.log(res)
//   if (typeof document !== 'undefined') document.write(`ParseObjects found: ${JSON.stringify(results)}`);
//   console.log('ParseObjects found:', results);
// }, (error) => {
//   if (typeof document !== 'undefined') document.write(`Error while fetching ParseObjects: ${JSON.stringify(error)}`);

//   console.error('Error while fetching ParseObjects', error);
// });
// })

//saeed
// app.put('/update/Mentor/:id', async(req, res) =>{
//   let id =req.params.id;
//   let {name, gender, age} = req.body;
//   var parseQuery =new Parse.Query("Mentor");
//   let queryResults = await parseQuery.get(id);
//   console.log(queryResults)
//     queryResults.set("name" , name);
//     queryResults.set("gender", gender);
//     queryResults.set("age", age)
//     try{
//     const result = await queryResults.save();
//     res.send('updated')
//     console.log('okay')
//     }catch(err){
//     console.log(err)
//     }

// })



//////////////////////////////////////////////////////////////////////////////////////
app.post('/login', async (req, res) => {
  try {
    const user = await Parse.User.logIn(req.body.username, req.body.password)
    res.send({"user" : user})
  } catch (error) {
    res.status(400)
    res.send({"error" : "Login failed: " + error })
  }
})

// Set up Linkedin OAuth here 
var router = express.Router();
const request = require('superagent');
const { User } = require('parse/node')

router.get('/profile', function(req, res, next){
  requestAccessToken(req.body.code, req.query.state)

  .then(response => {
    requestProfile(response.body.access_token)
    .then(response =>{
      console.log('response: ', response.body);

      res.render('profile', {profile: response.body})
    } );
  })
  .catch((error) => {
    res.status(500).send(`${error}`)
  })
})

function requestAccessToken(code, state){
  return request.post('https://www.linkedin.com/oauth/v2/accessToken')
    .send('grant_type=authorization_code')
    .send('redirect_uri= http://localhost:3000/profile')
    .send('client_id=86bj0k3tnixpok')
    .send('client_secret=9XSEs7KoTrAeu78b')
    .send(`code=${code}`)
    .send(`state=${state}`)
}

function requestProfile(token) {
  return request.get('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))')
  .set('Authorization', `Bearer ${token}`)
}
module.exports = app;
