import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { Department } from './schemas/schemas.js';

var msg = 'Hello World!';
console.log(msg);

const uri = `mongodb+srv://user0:${process.env.MONGO_KEY}@cluster0.tpyq1gp.mongodb.net/?retryWrites=true&w=majority`;

main().catch(err => console.log(err));

async function main() {
	await mongoose.connect(uri);

	/*
	const TechSupport = new Department({
		id: 0,
		name: 'Tech Support',
	});
	await TechSupport.save();
	*/
	
	const departments = await Department.find();
	console.log(departments);
}

