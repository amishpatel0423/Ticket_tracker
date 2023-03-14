// @ts-ignore
import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Department, User } from './schemas/schemas.js';
import express from 'express';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uri = `mongodb+srv://user0:${process.env.MONGO_KEY}@cluster0.tpyq1gp.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
const port = 3000;


// Public HTML/files
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/Signin/'));
app.use(express.urlencoded({ extended: true }));

// HTML get
app.get('/', (req, res) => {
	res.sendFile(__dirname+ '/index.html');
});
app.get('/login',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/signin.html');
});
app.get('/create',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/createticket.html');
});
app.get('/signup',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/Signup.html');
});
app.get('/dashboard',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/dashboard.html');
});
app.get('/profile',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/profile.html');
});
app.get('/ticket',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/ticket.html');
});


// Post requests
app.post('/signup', (req, res)=>{
	console.log(req.body);
	var pass, uname, email = req.body;

	create_account(uname, pass, email).catch(err => console.log(err));
	res.sendFile(__dirname+ '/Signin/dashboard.html');
});


async function create_account(fname, pass, email) {
	await mongoose.connect(uri);

	const TechSupport = new User({
		id: email,
		email: email,
		password: pass,
		username: fname,
		avatar: '',
		permission_level: 'User'
	});
	await TechSupport.save();
	
	const departments = await Department.find();
	console.log(departments);
}

app.listen(port);
console.log(`http://localhost:${port}`);