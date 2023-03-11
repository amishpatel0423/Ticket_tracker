// @ts-ignore
import {} from 'dotenv/config';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { Department } from './schemas/schemas.js';

var msg = 'Hello World!';
console.log(msg);

const uri = `mongodb+srv://user0:${process.env.MONGO_KEY}@cluster0.tpyq1gp.mongodb.net/?retryWrites=true&w=majority`;

import express from 'express';
const app = express();
const port = 3000;



app.use(express.static(__dirname+  '/Signin'));

app.get('/', (req, res) => {
	res.sendFile(__dirname+ '/index.html');
});

app.get('/login',(req,res)=>{
	res.sendFile(__dirname+ '/Signin/signin.html');
});


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

app.listen(port);