import mongoose, { model, Schema } from 'mongoose';

const departmentSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
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
	updated: {
		type: Date,
		default: Date.now(),
		required: true
	},
	department_id: {
		type: mongoose.Types.ObjectId,
		ref: 'Department'
	},
	creator_id: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
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
	},
	priority: {
		type: String,
		enum: ['Low', 'Medium', 'High', ''],
		default: '',
	}
});
ticketSchema.index({'$**': 'text'});

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
	avatar: {
		type: String,
		default: '',
	},
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	department_id: {
		type: Schema.Types.ObjectId,
		ref: 'Department'
	},
	permission_level: {
		type: String,
		enum: ['User', 'Manager', 'Admin'],
		required: true
	}
});

const commentSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	ticket_id: {
		type: Schema.Types.ObjectId,
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
	}
});


export const Department = model('Department', departmentSchema);
export const Ticket = model('Ticket', ticketSchema);
export const User = model('User', userSchema);
export const Comment = model('Comment', commentSchema);