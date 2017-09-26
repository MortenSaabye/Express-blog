const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const session = require('express-session')

const app = express()

const filePath = './persistance/posts.json'

//Log all incoming requests with morgan
app.use(morgan('combined'))

//parse incoming requests
app.use(bodyParser.urlencoded({extended:false}))

// initialize session middleware
app.use(session({
   resave: false,
   saveUninitialized: false,
   secret: 'supersecret'
}))

// Set username to empty string to prevent checking for undefined in views
app.locals.username = ""

// Set the view engine to ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/login', (req, res) => {
   console.log(req.session.username)
   res.render('login')
})
app.post('/login', (req, res) => {
   req.session.username = req.body.username
   res.redirect('/')
})

app.use((req, res, next) => {
   if (req.session.username == null) {
      // if user is not logged-in redirect back to login page //
      res.redirect('/login');
   } else {
      next();
   }
});


// routes
app.route('/')
   .get((req, res) => {
      fs.readFile(filePath, (err, data) => {
         posts = JSON.parse(data.toString())
         posts.reverse()
         res.render('index', { username: req.session.username, posts: posts })
      })
   })

   .post((req, res) => {
      const newComment = {
         "username": req.session.username,
         "commentId": Date.now(),
         "comment": req.body.comment
      }
      const postId = req.body.postId

      fs.readFile(filePath, (err, data) => {
         posts = JSON.parse(data.toString())
         posts.forEach((post, index) => {
            if (post.id == postId) {
               posts[index].comments.push(newComment)
            }
         })
         const postsString = JSON.stringify(posts, null, 2)
         fs.writeFile(filePath, postsString, (err) => {
            console.log(req.session.username)
            console.log("Comment was saved")
            res.redirect('/')
         })
      })
   })

app.route('/new-post')
   .get((req, res) => {
      res.render('new-post', {username: req.session.username})
   })
   .post((req, res) => {
      const newPost = {
         "username": req.session.username,
         "id": Date.now(),
         "headline": req.body.headline,
         "message": req.body.message,
         "comments": []
      }
      fs.readFile(filePath, (err, data) => {
         let posts = JSON.parse(data.toString())
         posts.push(newPost)
         const postsString = JSON.stringify(posts, null, 2)
         fs.writeFile(filePath, postsString, (err) => {
            console.log("Post was saved")
            res.redirect('/')
         })
      })
   })

app.route('/your-posts')
   .get((req,res) => {
      fs.readFile(filePath, (err, data) => {
         let allPosts = JSON.parse(data.toString())
         let yourPosts = []
         const username = req.session.username
         allPosts.forEach(post => {
            if (post.username === username) {
               yourPosts.push(post)
            }
         })
         yourPosts.reverse()
         res.render('your-posts', {username: username, posts: yourPosts})
      })
   })

app.get('/logout', (req, res) => {
   req.session.destroy()
   res.redirect('/')
})

app.listen(5000)