import { model, Schema } from 'mongoose';

const departmentSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	description: String,
	image: String
});

const ticketSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	title: String,
	desc: String,
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	dep_id: String,
	assignee_ids: [String],
	state: {
		type: String,
		enum: ['Pending', 'Closed', 'In Progress', 'Complete'],
		default: 'Pending',
		required: true
	}
});

const userSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	username: String,
	avatar: String,
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	dep_id: [String],
	permission_level: {
		type: String,
		enum: ['User', 'Manager', 'Admin']
	}
});

const customerSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: String,
	email: String,
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
});

const commentSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	user_id: String,
	ticket_id: String,
	reply_id: String,
	text: String,
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