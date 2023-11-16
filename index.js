const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
require("dotenv").config();

const cors = require("cors");
app.use(cors({optionSuccessStatus:200}));

app.use("/public", express.static(__dirname + "/public"));

const secret = process.env["MONGO_URI"];
mongoose.connect(secret)
.then(()=>{
	console.log("You've connected successfully connected to your database!");
})
.catch((err)=> console.error(err))

const URLSchema = mongoose.Schema({
	url:{
		type:String,
		required:true
	},
	shortURL:{
		type:String,
		required:true
	}
});
const URLModel = mongoose.model("url", URLSchema);


app.get("/",(req,res)=>{
	res.sendFile(__dirname + "/views/url-shortener-microservice.html");
})


const data = require(__dirname + "/public/data.json");
URLModel.find({
	url:"https://music.youtube.com",
	shortURL:"shorty0",
}).then((result)=>{
	if(!result.length){
		URLModel.create(data)
	}
})

const isUrl = require("is-url");
let number = 0;
let index = 0;
app.post("/api/shorturl",(req,res)=>{
  if(isUrl(req.body.url)){
	URLModel.find({url:req.body.url})
	.then((findings)=>{
		if(!findings.length){
			new URLModel({
				url:req.body.url,
				shortURL:produceShortURL()
			}).save()
			.then((entered)=>{
				res.json({
					original_url:entered.url,
					short_url:entered.shortURL
				})
			})
			.catch((err)=> console.error(err));
		}else{
			res.json({
				original_url:findings[0].url,
				short_url:findings[0].shortURL
			})

		}
	})
  }else{
  	res.json({
  		error:"invalid url"
  	})
  }
})

app.get("/api/shorturl/:shortURL",(req,res)=>{
	URLModel.find({shortURL:req.params.shortURL})
	.then((findings)=>{
		res.redirect(findings[0].url);
	})
})

app.get("/api/entries",(req,res)=>{
	URLModel.find({})
	.then((data)=>{
		res.json(data);
	})
	.catch((err)=> console.error(err))
})

app.listen(3000, ()=>{
	console.log("You're running a server!")
});

function produceShortURL(){
	const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","L","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	if(index < 52){
		return number + letters[index++]
	}else{
		index = 0;
		++number;
		return number + letters[index++];
	}
}
