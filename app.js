// @ts-ignore
import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { User } from './schemas/schemas.js';
import express from 'express';

// Connect to database
const uri = `mongodb+srv://user0:${process.env.MONGO_KEY}@cluster0.tpyq1gp.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri).then(
	// Promise fulfilled
	() => {
		console.info('Mongoose connected successfully');
	},
	// Promise rejected
	(err) => {
		console.error('Mongoose failed to connect', err);
	}
);

// App config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

// Public HTML/files
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/Signin/'));
app.use(express.urlencoded({ extended: true }));

// Serve webpasges / GET requests
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});
app.get('/login',(req,res)=>{
	res.sendFile(__dirname + '/Signin/signin.html');
});
app.get('/ticket/create',(req,res)=>{
	res.sendFile(__dirname + '/Signin/createticket.html');
});
app.get('/signup',(req,res)=>{
	res.sendFile(__dirname + '/Signin/Signup.html');
});
app.get('/dashboard',(req,res)=>{
	res.sendFile(__dirname + '/Signin/dashboard.html');
});
app.get('/profile',(req,res)=>{
	res.sendFile(__dirname + '/Signin/profile.html');
});
app.get('/ticket',(req,res)=>{
	res.sendFile(__dirname + '/Signin/ticket.html');
});

// Handle requests / POST requests
app.post('/signup', (req, res, next) => {
	const {email, uname, upass} = req.body;
	
	// Server-side data verification
	if(email.length <= 0) throw new Error('invalid email');
	if(uname.length <= 0) throw new Error('invalid name');
	if(upass.length <= 0) throw new Error('invalid password');

	// Create account
	const newUser = new User({
		email: email,
		name: uname,
		password: upass,
		permission_level: 'User'
	});
	newUser.save().then(
		// Success
		() => {
			// TODO: begin user session (auth)
			res.redirect('dashboard');
		},
		// Fail
		(err) => {
			// Error: email in use
			if(err.message.includes('dup key'))
				next('Email already in use! Please log in');
			next(err);
		}
	);
});

app.post('/login', (req, res, next) => {
	const {email, upass} = req.body;

	// Search for account
	User.find({email: email, password: upass}).then(
		// Success
		(doc) => {
			// Account exists
			if(doc) {
				// TODO: begin express session (auth)
				res.redirect('dashboard');
			}
			// Account not found
			next('Invalid credentials');
		},
		// Fail
		(err) => {
			next(err);
		}
	);
});

// Start server
app.listen(port);
console.log(`running at http://localhost:${port}`);
