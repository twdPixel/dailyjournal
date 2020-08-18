//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost:27017/WebSiteDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

const PostScheme = new mongoose.Schema({
  Title: {
    type: String,
    required: [true, "Please check your data entry"],
    unique: true
  },
  Paragraph: {
    type: String,
    required: [true, "Please check your data entry"],
  }
})

const DataPost = mongoose.model("post", PostScheme);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){

// PostPages();

  DataPost.find({}, function(err, foundItem){
      if (err) {
        console.log(err);
      }  else {
        res.render("home", {Post: foundItem});
      }
  });
  
});

// PostPages();


app.get("/about", function(req, res){
  res.render("about", {});
});

app.get("/contact", function(req, res){
  res.render("contact", {});
});

app.get("/compose", function(req, res){
  res.render("compose", {});
});

app.get("/redactor", function(req, res){
  DataPost.find({}, function(err, foundItem){
    if (err) {
      console.log(err);
    }  else {
      res.render("RedactMenu", {Data: foundItem});
        };
    });
});
 
  


app.post("/compose", function(req, res){
    let input = req.body.input;
    let textarea = req.body.textarea;
    
    let newData = new DataPost({
      Title: input.trim(),
      Paragraph: textarea.trim()
    });

    newData.save();

    console.log("Succsefull, document add to db")
    
    res.redirect("/");
    // PostPages();
});


function Delete(item, res){
    item = item.trim();
    console.log(item);
    DataPost.findOneAndRemove({Title: item}, function(err, doc){
      if (err) {
        console.error('Error while deleting item', err)
      } else {
          console.log("Delete the post", JSON.stringify(doc));
          res.redirect('/')
      }
    });
};

function AppDate(id, Title, Par, res){
  DataPost.updateOne({Title: id.trim()}, {Title: Title.trim(), Paragraph: Par}, function(err){
    if (err) {
      console.error('Error while updating item', err);
    } else {
      console.log("Redact");
      res.redirect('/')
    }
  });
}

app.post("/Redact", function(req, res){
    let Title = req.body.NewTitle;
    let Par = req.body.textarea;
    let id = req.body.OldTitle;
    let del = req.body.delete;
    let red = req.body.redact;


    if (del === "delete") {
        Delete(id, res);
    } else if (red === "redact") {
        AppDate(id, Title, Par, res);
    } else {
      console.log("U have some error")
    }

    console.log('here')
    // PostPages();
    // res.redirect("/")
});

app.get('/post/:title', function (req, res) {
  const title = req.params.title
  DataPost.findOne({Title: title}, function(err, item) {
    if (err) {
      console.error('Error while searching item ' + title, err)
      return res.sendStatus(500)
    }

    if (!item) {
      console.log('Found no item ' + title)
      return res.sendStatus(404)
    }

    let Title = item.Title;
    let Par = item.Paragraph;

    res.render("post", {Title: Title, Paragraph:Par});
  })
})

app.delete('/post/:title', function(req, res) {

})


function PostPages(){
  DataPost.find({}, function(err, foundItem){
    if (err) {
      console.log(err);
    }  else {

        foundItem.forEach(function(item){
          let Title = item.Title;
          let Par = item.Paragraph;
          app.get("/post/"+Title.replace(/\s/g, ''), function(req, res){
            res.render("post", {Title: Title, Paragraph:Par});
        });
        });
    }
  });
}



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
