const express = require('express')
const newPostRouter = express.Router()
const fs = require('fs')

const routes = (filePath) => {
   newPostRouter.route('/new-post')
      .get((req, res) => {
         res.render('new-post', { username: req.session.username })
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
   return newPostRouter
}

module.exports = routes