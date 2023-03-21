// @ts-nocheck
// @ts-ignore
import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Comment, Department, Ticket, User } from './schemas/schemas.js';
import express from 'express';
import compression from 'compression';
import minify from 'express-minify';
import session from 'express-session';
import bcrypt from 'bcrypt';

// === App config ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

app.use(compression());	// compress responses
app.use(minify()); // minify css & js
app.use(session({
	secret: process.env.AUTH_SECRET,
	resave: true,
	saveUninitialized: false
}));
app.use(express.urlencoded({ extended: true })); // Support HTML forms
app.use(express.json({limit: '20kb'})); // Support POST request JSON bodies

// Public HTML/files
app.use(express.static(__dirname + '/public/')); // adjust to express.static(__dirname + '/public/', { maxAge: 31557600 }); for caching

// === Serve webpages / GET requests ===
app.get('/', (req, res) => {
	res.redirect('/login');
});
app.get('/status', (req, res) => {
	res.sendStatus(200);
});

//	PROFILE / AUTH
app.get('/signup',(req,res)=>{
	if(!req.session.loggedin || !req.session.user) {
		res.sendFile(__dirname + '/pages/signup.html');
	}
	else res.redirect('/dashboard');
});
app.get('/login',(req,res)=>{
	if(!req.session.loggedin || !req.session.user) {
		res.sendFile(__dirname + '/pages/login.html');
	}
	else res.redirect('/dashboard');
});
app.get('/logout',(req,res)=>{
	req.session.loggedin = false;
	req.session.user = undefined;
	res.redirect('/login');
});
// view own profile
app.get('/profile',(req,res)=>{
	if(req.session.loggedin) {
		res.redirect(`/profile/${req.session.user.email}`);
	}
	else res.redirect('/login');
});
// view other's profiles
app.get('/profile/:email',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/pages/profile.html');
	}
	else res.redirect('/login');
});


// 	TICKETS
// create
app.get('/ticket/create',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/pages/ticket-create.html');
	}
	else res.redirect('/login');
});
// edit
app.get('/ticket/edit/:ticket',(req,res)=>{
	if(req.session.loggedin) {
		if(req.session.user.permission_level === 'Manager')
		{
			res.sendFile(__dirname + '/pages/ticket-edit.html');
		}
		else{
			res.redirect(`/ticket/${req.params.ticket}`);
		}
	}
	else res.redirect('/login');
});
// details
app.get('/ticket/:ticket',(req,res)=>{
	if(req.session.loggedin) {
		if(!(req.session.user.permission_level === 'Manager'))
		{
			res.sendFile(__dirname + '/pages/ticket-details.html');
		}
		else{
			res.redirect(`/ticket/edit/${req.params.ticket}`);
		}
	}
	else res.redirect('/login');
});

//	DASHBOARD
// dashboard
app.get('/dashboard',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/pages/dashboard.html');
	}
	else res.redirect('/login');
});
// search
app.get('/search',(req,res)=>{
	if(req.session.loggedin) {
		res.sendFile(__dirname + '/pages/search.html');
	}
	else res.redirect('/login');
});


// === Handle requests / POST requests ===
//	ACCOUNT / AUTH
// create account
app.post('/signup', (req, res) => {
	const {email, uname, upass} = req.body;
	
	// Server-side data verification
	if(email.length <= 0 || !(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/).test(email))
		res.status(400).json({error: 'invalid email'});
	else if(uname.length <= 0) 
		res.status(400).json({error: 'invalid name'});
	else if(upass.length <= 0) 
		res.status(400).json({error: 'invalid password'});

	else {
		// Hash password
		bcrypt.hash(upass, 10, (err, hash) => {
			// Create account
			const newUser = new User({
				email: email,
				name: uname,
				password: hash,
				permission_level: 'User'
			});
			newUser.save().then(
				// Success
				(doc) => {
					// Authenticate the user
					req.session.loggedin = true;
					req.session.user = doc;
					// Redurect to home page
					res.redirect('/dashboard');
				},
				// Fail
				(err) => {
					// Error: email in use
					if(err.message.includes('dup key'))
						res.status(401).json({error: 'Email already in use! Please log in'});
					res.status(400).json({error: err});
				}
			);
		});
	}
});
// login user
app.post('/login', function(req, res) {
	const {email, upass} = req.body;
	// Search for account
	User.find({email: email}).then(
		// Success
		(doc) => {
			// Account exists
			if(doc.length > 0) {
				// Check password
				bcrypt.compare(upass, doc[0].password, (err, result) => {
					// Password matches
					if(result) {
						// Authenticate the user
						req.session.loggedin = true;
						req.session.user = doc[0];
						// Redirect to home page
						res.redirect('/dashboard');
						res.end();
					}
					// Incorrect password
					else{
						res.status(401).json({error: 'Wrong password'});
					}
				});
			}
			// Account not found
			else{
				res.status(401).json({error: 'Account not found'});
			}
		},
		// Fail
		(err) => {
			res.status(400).json({error: err});
		}
	);
});
// fetch profiles given IDs
app.post('/profiles', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});

	else {
	// Search for users with matching user IDs
		User.find().where('_id').in(req.body._id).then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// search for profiles
app.post('/profile', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});

	else {
		// Search for users matching filters
		User.find(req.body).then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// upload profile picture
app.post('/profile/image', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(!req.body.img) 
		res.status(400).json({error: 'no image provided'});
	
	else {
		User.findOneAndUpdate({ _id: req.session.user._id }, { avatar: req.body.img }).then(
		// Success
			() => {
				res.end();
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// update user department
app.post('/profile/department', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(req.session.user.permission_level !== 'Manager') 
		res.status(400).json({error: 'insufficient permissions'});
	
	else {
		let update = { $unset: { department_id: null }};
		if(req.body.department_id)
			update = { department_id: req.body.department_id};

		User.findOneAndUpdate({ _id: req.body._id }, update).then(
		// Success
			() => {
				res.send('updated department');
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// check if current user is manager
app.post('/isManager', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	
	else 
		res.send({isManager: req.session.user.permission_level === 'Manager'});
});

//	TICKETS
// create new ticket
app.post('/ticket/create', (req, res) => {
	const {subject, details, department} = req.body;
	// Server-side validation
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(subject.length <= 0) 
		res.status(400).json({error: 'invalid subject'});
	else if(details.length <= 0) 
		res.status(400).json({error: 'invalid details'});
	else if(department.length <= 0) 
		res.status(400).json({error: 'invalid department'});

	else {
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
				res.status(400).json({error: err});
			}
		);
	}
});
// change ticket department 
app.post('/ticket/department', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(req.session.user.permission_level !== 'Manager') 
		res.status(400).json({error: 'insufficient permissions'});
	else if(!req.body.department_id) 
		res.status(400).json({error: 'no department ID'});

	else {
		Ticket.findOneAndUpdate({ _id: req.body._id}, { department_id: req.body.department_id, assignee_id: null }).then(
		// Success
			() => {
			// Reload page
				res.send(`Department_Id Updated to: ${req.body.department_id}`);
				res.end();
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// change ticket assignee 
app.post('/ticket/assignee', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(req.session.user.permission_level !== 'Manager') 
		res.status(400).json({error: 'insufficient permissions'});
	else if(!req.body.assignee_id) req.body.assignee_id = null;
	
	else {
		Ticket.findOneAndUpdate({ _id: req.body._id}, { assignee_id: req.body.assignee_id }).then(
		// Success
			() => {
			// Reload page
				res.send(`Assignee_Id Updated to: ${req.body.assignee_id}`);
				res.end();
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// change ticket status 
app.post('/ticket/status', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(req.session.user.permission_level !== 'Manager') 
		res.status(400).json({error: 'insufficient permissions'});
	else if(!['Pending', 'Closed', 'In Progress', 'Complete'].includes(req.body.state)) 
		res.status(400).json({error: 'invalid status'});
	
	else {
		Ticket.findOneAndUpdate({ _id: req.body._id}, { state: req.body.state }).then(
		// Success
			() => {
			// Reload page
				res.send(`State Updated to: ${req.body.state}`);
				res.end();
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// change ticket priority
app.post('/ticket/priority', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(req.session.user.permission_level !== 'Manager') 
		res.status(400).json({error: 'insufficient permission'});
	else if(!['Low', 'Medium', 'High', ''].includes(req.body.priority))
		res.status(400).json({error: 'invalid priority'});

	else {
		Ticket.findOneAndUpdate({ _id: req.body._id}, { priority: req.body.priority }).then(
		// Success
			() => {
			// Reload page
				res.send(`Priority Updated to: ${req.body.priority}`);
				res.end();
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// add new comment
app.post(['/ticket/edit/:ticket_id', '/ticket/:ticket_id'], (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.json({error: 'not logged in'});
	else if(!req.params.ticket_id) 
		res.status(400).json({error: 'no ticket ID'});
	else if(!req.body.comment) 
		res.status(400).json({error: 'no comment text'});

	else {
		const newComment = new Comment({
			user_id: req.session.user._id,
			ticket_id: req.params.ticket_id,
			text: req.body.comment
		});
		newComment.save().then(
		// Success
			() => {
				Ticket.findOneAndUpdate({_id: req.params.ticket_id}, {updated: Date.now()}, {timestamps: false}).exec();
				res.redirect(`/ticket/${req.params.ticket_id}`);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});

// search for ticket
app.post('/ticket', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});

	else {
	// Search for tickets matching filters
		Ticket.find(req.body).then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});

// Fetch tickets related to user ID
app.post('/user-tickets', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});

	else {
	// Search for tickets matching filters
		Ticket.find().or([{ creator_id: req.body._id}, {assignee_id: req.body._id }]).then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// Search for ticket by text match
app.post('/search', (req, res) => {
	if(!req.session.loggedin || !req.session.user)
		res.status(400).json({error: 'not logged in'});

	else {
		Ticket.find({ $text: { $search: req.query.query } }).then(
		// Success
			(doc) => {
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});

//	DEPARTMENTS
// create new department
app.post('/department/create', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});
	else if(req.session.user.permission_level !== 'Manager') 
		res.status(400).json({error: 'insufficient permissions'});
	else if(!req.body.name) 
		res.status(400).json({error: 'invalid department name'});
		
	else {
		const newDepartment = new Department({
			name: req.body.name
		});
		newDepartment.save().then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});
// search for department
app.post('/department', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});

	else {
	// Search for departments matching filters
		Department.find(req.body).then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});

//	COMMENTS
// search for comments
app.post('/comment', (req, res) => {
	if(!req.session.loggedin || !req.session.user) 
		res.status(400).json({error: 'not logged in'});

	else {
	// Search for comments matching filters
		Comment.find(req.body).then(
		// Success
			(doc) => {
			// Send fetched data
				res.send(doc);
			},
			// Fail
			(err) => {
				res.status(400).json({error: err});
			}
		);
	}
});



// === Connect to database ===
const uri = `mongodb+srv://user0:${process.env.MONGO_KEY}@cluster0.tpyq1gp.mongodb.net/${process.env.ENVIRONMENT}?retryWrites=true&w=majority`;
await mongoose.connect(uri).then(
	// Promise fulfilled
	() => {
		console.info('database connected');

		// === Start server ===
		app.listen(port);
		console.log(`running at http://localhost:${port}`);
	},
	// Promise rejected
	(err) => {
		console.error('database failed to connect:\n', err);
	}
);
