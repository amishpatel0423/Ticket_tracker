import mongoose, { model, Schema } from 'mongoose';

const departmentSchema = new Schema({
	name: {
		type: String,
		required: true
	}
});

const ticketSchema = new Schema({
	title: String,
	desc: String,
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	department_id: {
		type: mongoose.Types.ObjectId,
		ref: 'Department'
	},
	assignee_id: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	state: {
		type: String,
		enum: ['Pending', 'Closed', 'In Progress', 'Complete'],
		default: 'Pending',
		required: true
	}
});

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	avatar: String,
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	department_id: {
		type: mongoose.Types.ObjectId,
		ref: 'Department'
	},
	permission_level: {
		type: String,
		enum: ['User', 'Manager', 'Admin'],
		required: true
	}
});

const customerSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
});

const commentSchema = new Schema({
	user_id: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	},
	ticket_id: {
		type: mongoose.Types.ObjectId,
		ref: 'Ticket',
		required: true
	},
	text: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	edit_date: Date,
	is_internal: Boolean
});


export const Department = model('Department', departmentSchema);
export const Ticket = model('Ticket', ticketSchema);
export const User = model('User', userSchema);
export const Customer = model('Customer', customerSchema);
export const Comment = model('Comment', commentSchema);