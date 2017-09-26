const express = require('express')
const rootRouter = express.Router()
const fs = require('fs')


const routes = (filePath) => {
   rootRouter.route('/')
      .get((req, res) => {
         fs.readFile(filePath, (err, data) => {
            posts = JSON.parse(data.toString())
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
               console.log("Data was saved")
               res.redirect('/')
            })
         })
      })
   return rootRouter
}
module.exports = routes