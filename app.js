// @ts-ignore
import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Department, Ticket, User } from './schemas/schemas.js';
import express from 'express';

// Connect to database
const uri = `mongodb+srv://user0:${process.env.MONGO_KEY}@cluster0.tpyq1gp.mongodb.net/?retryWrites=true&w=majority`;
await mongoose.connect(uri).then(
	// Promise fulfilled
	() => {
		console.info('mongoose connected successfully');
	},
	// Promise rejected
	(err) => {
		console.error('mongoose failed to connect:\n', err);
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
app.use(express.static(__dirname + '/MyProfile/'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
	res.sendFile(__dirname + '/MyProfile/dashboard.html');
});
app.get('/profile',(req,res)=>{
	res.sendFile(__dirname + '/MyProfile/myprofile.html');
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

app.post('/ticket/create', (req, res, next) => {
	const {subject, details, department} = req.body;
	
	// Server-side data verification
	if(subject.length <= 0) throw new Error('invalid subject');
	if(details.length <= 0) throw new Error('invalid details');
	if(department.length <= 0) throw new Error('invalid department');
	
	// Create account
	const newTicket = new Ticket({
		title: subject,
		desc: details,
		department_id: department,
		state: 'Pending'
	});
	newTicket.save().then(
		// Success
		() => res.redirect('/dashboard'),
		// Fail
		(err) => {
			next(err);
		}
	);
});

app.post('/department', (req, res, next) => {
	// Search for tickets matching filters
	Department.find(req.body).then(
		// Success
		(doc) => {
			// Send fetched data
			res.send(doc);
		},
		// Fail
		(err) => {
			next(err);
		}
	);
});

app.post('/ticket', (req, res, next) => {
	// Search for tickets matching filters
	Ticket.find(req.body).then(
		// Success
		(doc) => {
			// Send fetched data
			res.send(doc);
		},
		// Fail
		(err) => {
			next(err);
		}
	);
});

app.post('/profile', (req, res, next) => {
	// Search for tickets matching filters
	console.log(req.body._id);
	User.find().where('_id').in(req.body._id).then(
		// Success
		(doc) => {
			console.log(doc);
			// Send fetched data
			res.send(doc);
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
