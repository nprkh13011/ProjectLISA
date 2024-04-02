import {
	checkName,
	checkEmail,
	checkPassword,
	checkString,
	checkId,
	checkAge,
	checkInt,
} from "../utils/helpers.js";
import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const saltRounds = 8;

export const createLog = () => {
	let battery = Math.floor(Math.random() * 101);
	let screenTime = Math.floor(Math.random() * 1440);
	// let normal = Math.floor(Math.random() * 90);
	// let performance = Math.floor(Math.random() * (100 - normal));
	// let energySaver = 100 - normal - performance;
	let normal = Math.floor(Math.random() * screenTime);
	let performance = Math.floor(Math.random() * (screenTime - normal));
	let energySaver = screenTime - normal - performance;
	let downloaded = Math.floor(Math.random() * 20);
	let streamTime = Math.floor(Math.random() * screenTime);
	let idleTime = Math.floor(Math.random() * (screenTime - streamTime));
	// let start1 = Math.floor(Math.random() * 100);
	// let end1 = Math.floor(Math.random() * (101 - start1)) + start1;
	// let lastCycle = {start: start1, end: end1};
	let lastCycle = Math.floor(Math.random() * 25);
	let previousDeleted = Math.floor(Math.random() * (1000));
	let currentDeleted = Math.floor(Math.random() * (1000));
	let log = {
		currentBattery: battery,
		screenTime: screenTime,
		normal: normal,
		performance: performance,
		energySaver: energySaver,
		downloaded: downloaded,
		streamTime: streamTime,
		idleTime: idleTime,
		lastCycle: lastCycle,
		previousDeleted: previousDeleted,
		currentDeleted: currentDeleted};
	return log;
};

export const registerUser = async (
	firstName,
	lastName,
	email,
	password,
	ageInput,
	occupation,
	geography,
	numberDevices,
	os,
	phoneSys
) => {
	if (
		!firstName ||
		!lastName ||
		!email ||
		!password ||
		!ageInput ||
		!occupation ||
		!geography ||
		!numberDevices ||
		!os ||
		!phoneSys
	) {
		console.log("Missing input fields:", {
			firstName,
			lastName,
			email,
			password,
			ageInput,
			occupation,
			geography,
			numberDevices,
			os,
			phoneSys,
		});
		throw "All input fields must be provided (registerUser)";
	}
	firstName = checkName(firstName, "First name");
	lastName = checkName(lastName, "Last name");
	email = checkEmail(email);
	password = checkPassword(password);
	let emailExists = await emailAlreadyExists(email);
	if (emailExists) {
		throw `emailAddress already exists (createUser)`;
	}
	const hashed = await bcrypt.hash(password, saltRounds);
	let log = createLog();
	ageInput = checkInt(ageInput);
	ageInput = checkAge(ageInput);
	occupation = checkString(occupation);
	geography = checkString(geography);
	numberDevices = checkInt(numberDevices);
	os = checkString(os);
	phoneSys = checkString(phoneSys);

	let newUser = {
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: hashed,
		devices: [],
		points: 0,
		ageInput: ageInput,
		occupation: occupation,
		geography: geography,
		numberDevices: numberDevices,
		os: os,
		phoneSys: phoneSys,
		log: log,
	};
	const userCollection = await users();
	const newInsertInformation = await userCollection.insertOne(newUser);
	if (!newInsertInformation.insertedId) {
		throw "Insert failed!";
	}
	return await getUserById(newInsertInformation.insertedId.toString());
};

export const emailAlreadyExists = async (email) => {
	if (!email) {
		throw `Error: email must be inputed`;
	}
	email = checkEmail(email);

	const userCollection = await users();
	const user = await userCollection.findOne({ email: email });
	if (!user) {
		return false;
	} else {
		return true;
	}
};

export const updateLog = async (userId) => {
	if (!userId) {
		throw "Error: User ID must be provided";
	}
	userId = checkId(userId);

	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(userId) });

	if (!user) {
		throw "Error: User not found";
	}

	const log = createLog();

	const updateResult = await userCollection.updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { log: log } }
	);

	if (updateResult.modifiedCount === 0) {
		throw "Error: Log update failed";
	}

	return log;
};

export const checkUser = async (email, password) => {
	if (!email || !password) {
		throw "All input fields must be provided";
	}

	email = checkEmail(email);
	password = checkString(password, "Password");

	const userCollection = await users();

	const user1 = await userCollection.findOne({ email: email });
	let validPassword = await bcrypt.compare(password, user1.password);
	if (validPassword) {
		const log = createLog();
		const updateResult = await userCollection.updateOne(
			{ _id: user1._id },
			{ $set: { log: log } }
		);
		if (updateResult.modifiedCount === 0) {
			throw "Error: Log update failed";
		} else {
			const user = await userCollection.findOne({ email: email });
			let firstName = user.firstName;
			let lastName = user.lastName;
			let emailAddress = user.email;
			let _id = user._id.toString();
			let devices = user.devices;
			let log = user.log;
			return { _id, firstName, lastName, emailAddress, devices, log };
		}
	} else {
		throw "Either the email address or password is invalid";
	}
};

export const updateUser = async (
	id,
	firstName,
	lastName,
	email,
	password,
	ageInput,
	occupation,
	geography,
	numberDevices,
	os,
	phoneSys
) => {
	let hashed1;
	if (id) {
		id = checkId(id);
	} else {
		throw `Error: No id given`;
	}
	if (firstName) {
		firstName = checkName(firstName);
	}
	if (lastName) {
		lastName = checkName(lastName);
	}
	if (email) {
		email = checkEmail(email);
	}
	if (password) {
		password = checkPassword(password);
		hashed1 = await bcrypt.hash(password, saltRounds);
	}

	let oldUser = await getUserById(id);
	let emailExists = false;

	if (oldUser.email !== email && email) {
		emailExists = await emailAlreadyExists(email);
		if (emailExists) {
			throw `Email already exists (updateUser)`;
		}
	}
	if (ageInput) {
		ageInput = checkInt(ageInput);
		ageInput = checkAge(ageInput);
	}
	if (occupation) {
		occupation = checkString(occupation);
	}
	if (geography) {
		geography = checkString(geography);
	}
	if (numberDevices) {
		numberDevices = checkInt(numberDevices);
	}
	if (os) {
		os = checkString(os);
	}
	if (phoneSys) {
		phoneSys = checkString(phoneSys);
	}

	const userUpdate = {
		firstName: firstName ? firstName : oldUser.firstName,
		lastName: lastName ? lastName : oldUser.lastName,
		email: email ? email : oldUser.email,
		password: hashed1 ? hashed1 : oldUser.password,
		devices: oldUser.devices,
		points: oldUser.points,
		ageInput: ageInput ? ageInput : oldUser.ageInput,
		occupation: occupation ? occupation : oldUser.occupation,
		geography: geography ? geography : oldUser.geography,
		numberDevices: numberDevices ? numberDevices : oldUser.numberDevices,
		os: os ? os : oldUser.os,
		phoneSys: phoneSys ? phoneSys : oldUser.phoneSys,
		log: oldUser.log,
	};

	const userCollection = await users();

	const updateInfo = await userCollection.replaceOne(
		{ _id: new ObjectId(id) },
		userUpdate
	);
	console.log("update" + updateInfo);

	if (updateInfo.modifiedCount === 0) {
		throw `At least one field must be different to successfully update user`;
	}
	let newInfo = await getUserById(id);
	console.log("new" + newInfo);
	return newInfo;
};

export const deleteUser = async (id) => {
	if (!id) {
		throw `Error: Id must be inputed`;
	}
	id = checkId(id);

	const userCollection = await users();
	const user = await userCollection.findOneAndDelete({
		_id: new ObjectId(id),
	});
	if (deletionInfo.lastErrorObject.n === 0) {
		throw `Error: Could not delete user with id of ${id}`;
	}

	return { ...deletionInfo.value, deleted: true };
};

export const getAllUsers = async () => {
	const userCollection = await users();
	const userList = await userCollection.find({}).toArray();
	return userList;
};

export const getUserById = async (id) => {
	if (!id) {
		throw "Error: Id must be inputed";
	}
	id = checkId(id);
	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(id) });
	if (!user) throw "Error: User not found";
	user._id = user._id.toString();
	return user;
};

export const getUserByEmail = async (email) => {
	if (!email) {
		throw "Error: Email must be inputed";
	}
	email = checkEmail(email);
	const userCollection = await users();
	const user = await userCollection.findOne({ email: email });
	if (!user) throw "Error: User not found";
	user._id = user._id.toString();
	return user;
};

export const helpTicket = async (email, message) => {
	if (!email) {
		throw "Error: Email must be inputed";
	}
	if (typeof email != "string") {
		throw "Error: Email must be a string";
	}
	if (email.length == 0 || email.trim().length == 0) {
		throw "Error: Email cannot be an empty string";
	}
	email = email.trim();
	if (!message) {
		throw "Error: Message must be inputed";
	}
	if (typeof message != "string") {
		throw "Error: Message must be a string";
	}
	if (message.length == 0 || message.trim().length == 0) {
		throw "Error: Message cannot be an empty string";
	}
	message = message.trim();
	const userCollection = await users();
	const user = await userCollection.findOne({ email: email });
	if (!user) {
		throw "Error: User not found";
	}
	const newTicket = {
		email: email,
		message: message,
	};
	const updateInfo = await userCollection.updateOne(
		{ email: email },
		{ $push: { helpTickets: newTicket } }
	);
	if (updateInfo.modifiedCount === 0) {
		throw "Error: Could not update user";
	}
	return true;
};

export const getTotalPoints = async (userId) => {
	if (!userId) {
		throw "Error: User Id must be inputed";
	}
	if (typeof userId != "string") {
		throw "Error: User Id must be a string";
	}
	if (userId.length == 0 || userId.trim().length == 0) {
		throw "Error: User Id must not be an empty string or only include empty spaces";
	}
	userId = userId.trim();
	const userCollection = await users();
	const user = await getUserById(userId);
	const totalPoints = user.points;

	const updatedUser = await userCollection.findOne(
		{ _id: new ObjectId(userId) },
		{ points: totalPoints }
	);
	// console.log(updatedUser);
	return updatedUser.points;
};

export const subtractPoints = async (userId, rewardPoints) => {
	if (!userId) {
		throw "Error: User Id must be inputed";
	}
	if (typeof userId != "string") {
		throw "Error: User Id must be a string";
	}
	if (!rewardPoints) {
		throw "Error: Reward Points must be inputed";
	}
	if (typeof rewardPoints != "number") {
		throw "Error: Reward Points must be a number";
	}
	if (rewardPoints <= 0) {
		throw "Error: Reward Points must be greater than 0";
	}
	if (rewardPoints % 1 != 0) {
		throw "Error: Reward Points must be an integer";
	}
	if (userId.length == 0 || userId.trim().length == 0) {
		throw "Error: User Id must not be an empty string or only include empty spaces";
	}
	userId = userId.trim();
	const userCollection = await users();
	const user = await getUserById(userId);
	// check if the user has enough points to subtract
	if (user.points < rewardPoints) {
		throw "Error: User does not have enough points to subtract";
	}
	// subtract the points
	const newPoints = user.points - rewardPoints;
	const updatedUser = await userCollection.updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { points: newPoints } }
	);
	if (updatedUser.modifiedCount === 0) throw "Error: Could not update user";
	return true;
};

export const addPoints = async (userId, rewardPoints) => {
	if (!userId) {
		throw "Error: User Id must be inputed";
	}
	if (typeof userId != "string") {
		throw "Error: User Id must be a string";
	}
	if (userId.length == 0 || userId.trim().length == 0) {
		throw "Error: User Id must not be an empty string or only include empty spaces";
	}
	if (!rewardPoints) {
		throw "Error: Reward Points must be inputed";
	}
	if (typeof rewardPoints != "number") {
		throw "Error: Reward Points must be a number";
	}
	if (rewardPoints <= 0) {
		throw "Error: Reward Points must be greater than 0";
	}
	if (rewardPoints % 1 != 0) {
		throw "Error: Reward Points must be an integer";
	}
	userId = userId.trim();
	const userCollection = await users();
	const user = await getUserById(userId);
	// add the points
	const newPoints = user.points + rewardPoints;
	const updatedUser = await userCollection.updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { points: newPoints } }
	);
	if (updatedUser.modifiedCount === 0) throw "Error: Could not update user";
	return true;
};

export const getTips = async () => {
	// array of tips as a string
	let tipArray = [
		"Ask suppliers to email you a receipt instead of printing it out",
		"Use natural light during the day instead of overhead lighting or lamps",
		"Organize carpool to work/events",
		"Follow scheduled maintenance for vehicles",
		"Switch to LED lighting",
		"Unplug large electronics when not in use",
		"Turn off your car when parked or in a gridlocked traffic jam",
		"Change the air filter in your air conditioning unit",
		"Keep the coils in the back of your refrigerator clean",
		"Consider travel alternatives to flying",
	];
	let randomTips = [];
	// randomizes through the array and generates an array of 3 tips
	for (let i = 0; i < 3; i++) {
		let randomIndex = Math.floor(Math.random() * tipArray.length);
		randomTips.push(tipArray[randomIndex]);
		tipArray.splice(randomIndex, 1);
	}
	// returns the array of 3 tips
	return randomTips;
};

export const getTopUsers = async () => {
	const userCollection = await users();
	const topUsers = await userCollection
		.find({})
		.sort({ points: -1 })
		.toArray();
	return topUsers;
};
