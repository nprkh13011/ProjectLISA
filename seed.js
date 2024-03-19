import { addPoints, registerUser } from './data/users.js';
import { registerDevice } from './data/devices.js';
import { dbConnection, closeConnection } from './config/mongoConnection.js';

//lets drop the database each time this is run
const db = await dbConnection();
await db.dropDatabase();

async function main() {
    let user1, user2, user3, device1, device2, device3;
    try {
        user1 = await registerUser(
            "Areeb",
            "Chaudhry",
            "areeb@gmail.com",
            "Qwertyuiop@123",
            '21',
            'student',
            'urban',
            '3',
            'windows',
            'ios'
        );
        user2 = await registerUser(
            "Shailaja",
            "Vyas",
            "svyaslol@gmail.com",
            "Hello!123",
            '22',
            'student',
            'suburban',
            '2',
            'windows',
            'android'

        );
        user3 = await registerUser(
            "Mariam",
            "Dardir", 
            "mariamd@gmail.com", 
            "Happy123!",
            '21',
            'student',
            'suburban',
            '1',
            'windows',
            'ios'
        );
        await addPoints(user1._id, 100);
        await addPoints(user2._id, 250);
        await addPoints(user3._id, 1150);
    } catch (e) {
        console.log("User: " + e);
    }

    try {
        device1 = await registerDevice(
            user1._id.toString(),
            "fh938hr0rq0irih0rjrjs",
            "Lenovo ThinkPad X1 Carbon Gen 11",
            ["Unplug charger from device before bedtime", "Download content instead of streaming"]
        )
        device2 = await registerDevice(
            user1._id.toString(),
            "qhw4hr9iasdhsi0rjqwrw",
            "Legion Pro 7i Gen 9",
            ["Clean out inbox", "Recharge before device reaches 20%", "Turn off wifi at night"]
        )
    } catch (e) {
        console.log("Device" + e);
    }
}

await main();
await closeConnection();
