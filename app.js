// @ts-nocheck
// @ts-ignore
import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Department, Ticket, User } from './schemas/schemas.js';
import express from 'express';
import session from 'express-session';

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

app.use(session({
	secret: process.env.AUTH_SECRET,
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true })); // Support HTML forms
app.use(express.json()); // Support POST request JSON bodies

// Public HTML/files
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/Signin/'));
app.use(express.static(__dirname + '/MyProfile/'));

// Serve webpasges / GET requests
app.get('/', (req, res) => {
	res.redirect('/login');
});
app.get('/login',(req,res)=>{
	if(!req.session.loggedin) {
		res.sendFile(__dirname + '/Signin/signin.html');
	}
	else res.redirect('/dashboard');
});
app.get('/ticket/create',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/Signin/createticket.html');
	}
	else res.redirect('/login');
});
app.get('/signup',(req,res)=>{
	if(!req.session.loggedin) {
		res.sendFile(__dirname + '/Signin/Signup.html');
	}
	else res.redirect('/dashboard');
});
app.get('/dashboard',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/MyProfile/dashboard.html');
	}
	else res.redirect('/login');
});
app.get('/profile',(req,res)=>{
	if(req.session.loggedin) {
		res.redirect(`/profile/${req.session.user.email}`);
	}
	else res.redirect('/login');
});
app.get('/profile/:email',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/MyProfile/myprofile.html');
	}
	else res.redirect('/login');
});
app.get('/ticket',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/TicketDetail page/Ticketdetails.html');
	}
	else res.redirect('/login');
});
app.get('/logout',(req,res)=>{
	req.session.loggedin = false;
	req.session.user = undefined;
	res.redirect('/login');
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
			res.redirect('/dashboard');
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

app.post('/login', function(req, res, next) {
	const {email, upass} = req.body;

	// Search for account
	User.find({email: email, password: upass}).then(
		// Success
		(doc) => {
			// Account exists
			if(doc.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.user = doc[0];
				// Redirect to home page
				res.redirect('/dashboard');
				res.end();
			}
			// Account not found
			else{
				res.status(401).send('Invalid credentials');
			}
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
	if(!req.session.loggedin) throw new Error('not logged in');

	// Create ticket
	const newTicket = new Ticket({
		title: subject,
		desc: details,
		department_id: department,
		creator_id: req.session.user._id,
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
	if(!req.session.loggedin) throw new Error('not logged in');

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
	if(!req.session.loggedin) throw new Error('not logged in');

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

// Fetch tickets related to user ID
app.post('/user-tickets', (req, res, next) => {
	if(!req.session.loggedin) throw new Error('not logged in');
	
	// Search for tickets matching filters
	Ticket.find().or([{ creator_id: req.body._id}, {assignee_id: req.body._id }]).then(
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

// Fetch profiles given IDs
app.post('/profiles', (req, res, next) => {
	if(!req.session.loggedin) throw new Error('not logged in');

	// Search for users with matching user IDs
	User.find().where('_id').in(req.body._id).then(
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
	if(!req.session.loggedin) throw new Error('not logged in');

	// Search for users matching filters
	User.find(req.body).then(
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

// Start server
app.listen(port);
console.log(`running at http://localhost:${port}`);
