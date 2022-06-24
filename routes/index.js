const { Router } = require('express');
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')
const passport = require ('passport');
const session = require ('express-session');
const GoogleStrategy = require ('passport-google-oauth').OAuth2Strategy;
require('dotenv').config()

var sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./routes/mock.db',sqlite3.OPEN_READWRITE,(err)=>{
  if(err) return console.error(err.message);
  console.log("connection successful")
})

router.get('/', (req, res) => {
  res.render('index', { title: 'First Web Node' });
});
router.post("/comentario",(req,res)=>{

  console.log(req.body)
  console.log(req.socket.remoteAddress)
let ip = req.socket.remoteAddress
let correo = req.body.user_mail
let comentario = req.body.user_message
let nombre =req.body.user_name


var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

  //let body= req.body;
  let capt;
        const requi = req.body['g-recaptcha-response']
        const key = process.env.CAPTCHA_PRIVADA
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${key}&response=${requi}`;
    fetch(url, {
      method: 'post',
    })
      .then((response) => response.json())
      .then((google_response) => {
        if (google_response.success == true) {      
        console.log('Captcha correcto'); 
const sql='INSERT INTO comentarios (nombre, correo, ip, comentario,fecha) VALUES(?,?,?,?,?)';

db.run(
sql,
[nombre,correo,ip,comentario,dateTime],
(err) => {
  if(err) return console.error(err.message);
 }
) } else{  
  res.redirect('/')
  console.log('Realice el captcha')
      }  } );



res.redirect('/');
//res.send(console.log({message:'success'}))


/*db.close((err) =>{
  if (err) return console.error(err.message);
}
)*/



})
router.get('/contactos', (req, res) => {

  const sql = 'SELECT * FROM comentarios' 

  db.all(sql,[],(err,rows)=>{
    if(err) return console.error(err.message);

    rows.forEach((row)=>{
      console.log(row);
      console.log('a')
    res.render('contactos',{ data: JSON.stringify(rows) });
 
    });
  });

});

module.exports = router;

router.get ('/login' , (req,res) => {
    res.render("login")
  });


const usuarioP = process.env.USUARIO;
const passwordP = process.env.PASSWORD;
console.log(usuarioP , passwordP)
router.post('/login' , (req,res) => {
  const userx=req.body.userx;
  const pasworx=req.body.pasworx;
    console.log(userx,pasworx)
if (userx === usuarioP && pasworx === passwordP) {

res.redirect('/contactos')

}else{
    res.send("Usuario o contraseña incorrecta")
}

});

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/login/federated/google', passport.authenticate('google'));

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENTE_ID,
    clientSecret: process.env.GOOGLE_SECRETO_CL,
    callbackURL: "https://formularioisa.herokuapp.com/google/callback",
  scope: [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  ],
  session: false,
  },
  function (accessToken, refreshToken, profile, done) {
  console.log(profile); 
  done(null, profile)
    }));



  router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/contactos',
  failureRedirect: '/login'
  }));

  router.use (session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));

  router.get('/redirect/google', passport.authenticate('google', {
    successRedirect: '/contactos',
    failureRedirect: '/login'
  }));

  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, name: user.name });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });