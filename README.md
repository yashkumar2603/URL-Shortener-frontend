### Basic Working - 
The basic workings of a URL shortener is straightforward. 
I will be making a REST API(Representational State Transfer API) for the shortening part, then  make the frontend for the final usable web app. 
In the short URL generation part, the API takes in a POST request with the original URL as a payload. A unique ID is generated that corresponds to the original URL. This ID is added to the end of the base URL, i.e., the URL of your application.

The generated URL and the original URL are stored in the database.
When a user visits the shortened URL, the shortened URL is searched in the database. The user is redirected to the original URL if the URL is found. Also, the number of clicks on the URL increases by `1` in the database. Otherwise, it returns an error:
### Planning the URL Shortener build process in Node.js - 
Let’s first plan out the building process. As aforementioned, for each URL passed into our API, we will generate a unique ID and create a short URL with it. Then, the long URL, short URL, a variable click with the value of `0`, and unique ID will be stored in the database.

When a user sends a GET request to the short URL, the URL will be searched within the database, and the user will be redirected to the corresponding original URL. Sound complex? Don’t worry, we’ll cover everything you need to know.

### Setup Steps - 
Let’s use the command `npm init` in the project directory to initialize. After the initialization, we need to add one more line in the generated `package.json` file. Open the `package.json` file and add the line `"type": "module"` at the end of the file. Adding this line in the `package.json` file will allow us to import dependencies using the `import` statement. Once the project is initialized, we are going to install the required dependencies.
The dependencies that we need are:

- dotenv: this package loads the environment variables from a file called `.env` to `process.env`
- Express.js: this is a minimal and flexible web application framework for Node.js
- Mongoose: this is a MongoDB object modeling tool for Node.js
- NanoID: This package enables us to generate the short IDs for our URLs

The only developer dependency that we need is `nodemon`. The `nodemon` package is a simple tool that automatically restarts the Node.js server when a file change occurs.
Installing Dependencies - 
`npm i dotenv express mongoose nanoid`
`npm i -D nodemon`

Now make sure that the package.json file looks like this - 
```JSON
{
  "name": "url-short",
  "version": "1.0.0",
  "description": "URL Shortener Project ",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "mongoose": "^5.12.13",
    "nanoid": "^4.0.0"
  },
  "type": "module"
}
```

### Coding - 
Now we create our server in our `app.js` file using Express. To set up an Express server, we need to import the Express package into the `app.js` file. Once the package is imported, initialize and store it into a variable called `app`.
use the available `listen` function to create the server. Setup server as -
```javascript
// Server Setup
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
```
used port `3333` to run the server. The `listen` method in Express starts a UNIX socket and listens for a connection in a given port.

Now, i create a .env file inside the config folder to store the MOngoDB SRV URI and the base URL. The base URL will be the local host server location for now. 
```
PORT=3333
MONGO_URI=mongodb+srv://nemo:YourPasswordHere@cluster0.mkws3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
BASE=http://localhost:3333
```

Remember to change the `<password>` field in the MongoDB URI with the database password.
#### Connecting the database to the app - 
import the Mongoose and dotenv dependencies into your `db.js` file, which is inside the `config` folder:
```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
```
The `path` object key is passed inside the `dotenv` config because the `.env` file is not located in the root directory. We are passing the location of the `.env` file through this.

Now create an asynchronous function called `connectDB` within a file called `db.js`, inside the `config` folder. I’ll use async/await for this :
```javascript
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
```

In the `try` block, we wait for Mongoose to connect with the given MongoDB URI. The first parameter in the `mongoose.connect` method is the MongoDB SRV URI. Notice that the two key-value pairs are passed in the second parameter to remove the console warnings. Let’s understand what the two key-value parameters mean:

- `useNewUrlParser: true`: the underlying MongoDB driver has deprecated the current connection string parser. This is why it has added a new flag. If the connection encounters any issue with the new string parser, it can fall back to the old one
- `useUnifiedTopology: true`: this is set to `false` by default. Here, it is set to `true` so that the MongoDB driver’s new connection management engine can be used

If any error occurs within the `catch` statement, we will console log the error and exit with `process.exit(1)`. Finally, we export the function with `module.exports`.

Now, import the `db.js` file into the `app.js` file with `import connectDB from './config/db.js';` and call the `connectDB` function with `connectDB()`.

#### mongoose Schema-
We’ll use a Mongoose schema to determine how data is stored in MongoDB. Essentially, the Mongoose schema is a model for the data.  
create a file called `Url.js` inside a `models` folder. Import Mongoose here, then use the `mongoose.Schema` constructor to create the schema.
The parent object keys are the keys that are going to be stored inside the database. We define each data key. Note that there is a required field for some and a default value for other keys.

Finally, we export the schema using `export default mongoose.model('Url', UrlSchema);`. The first parameter inside `mongoose.model` is the singular form of the data that is to be stored, and the second parameter is the schema itself.

#### Building URL and index Routes -
The URL route will create a short URL from the original URL and store it inside the database. 
Create a folder called `routes` in the root directory and a file named `urls.js` inside of it. 
we use the Express router here. First, import all of the necessary packages, like so:

The `utils.js` file inside the `utils` folder consists of a function that checks if a passed URL is valid or not. Here’s the code for the `utils.js` file:
```javascript
// Check if URL input is valid
export function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:[/?#]\\S*)?$/i.test(
    value
  );
}
```
*I found this on the internet, dont know how it works, but i guess it works pretty fine.*

We will use the HTTP post request in the `urls.js` file to generate and post the details to the database:

Inside the `router.post()` function - 

The `const { origUrl } = req.body;` will extract the `origUrl` value from the HTTP request body. Then we store the base URL into a variable. `const urlId = nanoid()` is generating and storing a unique short ID to a variable. You can also specify the size of the `urlId` by passing the size inside the `nanoid` function. For example, writing `nanoid(8)` will generate a unique ID of length `8`.
Once it is generated, we check if the original URL is valid using our function from the `utils` directory. For valid URLs, we move into the `try` block.
Here, we first search if the original URL already exists in our database with the `Url.findOne({ origUrl });` Mongoose method. If found, we return the data in JSON format; otherwise, we create a short URL combining the base URL and the short ID.
Then, using our Mongoose model, we pass in the fields to the model constructor and save it to the database with the `url.save();` method. Once saved, we return the response in JSON format.
Unexpected errors for the `try` block are handled in the `catch` block, and invalid URLs that return `false` in our `validateUrl` function send back a message that the URL is invalid. Finally, we export the router.
We use the body parser included in Express, by adding this to the app.js file - 
```javascript
// Body Parser
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
```

Because we are using the `/api` endpoint, our complete endpoint becomes `http://localhost:3333/api/short`. Here’s an example:

#### Handling Redirection - 
Now create another file called `index.js` inside the `routes` folder to handle the redirection process. In this file, import the necessary dependencies:
```javascript
import express from 'express';
import Url from '../models/Url.js';
const router = express.Router();
```
Here, we are first going to search our database for the short URL ID that is passed. If the URL is found, we’ll redirect to the original URL:

```javascript
router.get('/:urlId', async (req, res) => {
  try {
    const url = await Url.findOne({ urlId: req.params.urlId });
    if (url) {
      await Url.updateOne(
        {
          urlId: req.params.urlId,
        },
        { $inc: { clicks: 1 } }
      );
      return res.redirect(url.origUrl);
    } else res.status(404).json('Not found');
  } catch (err) {
    console.log(err);
    res.status(500).json('Server Error');
  }
});

export default router;
```

The HTTP `GET` request is getting the URL ID with the help of `:urlId`. Then, inside the `try` block, we find the URL using the `Url.findOne` method, similar to what we did in the `urls.js` route.
If the URL is found, we increase the number of clicks to the URL and save the click amount. to avoid the race condition which involves multiple processes or threads trying to update the `clicks` field of a MongoDB document simultaneously, we are using the MongoDB `$inc` method here for incrementing the clicks.
The `updateOne` method is called on the Mongoose model. In the `updateOne` function, the first parameter is passed as the condition. Here, the condition is to match the `urlId` in the model with the `urlId` found in the URL parameter. If the condition matches, the `clicks` value is increased by `1`. Finally, we redirect the user to the original URL using `return res.redirect(url.origUrl);`.

If the URL is not found, we send a JSON message that the URL is not found. Any uncaught exception is handled in the `catch` block. We console log the error and send a JSON message of “Server Error.” Finally, we export the router.
Import the route to the `app.js` file, and our URL shortener API is now ready to use.

## API Reference
### Shorten URL
```httpspec
  POST /api/short
```

| Field | Type   | Description  |
| :---- | :----- | :----------- |
| Body  | `json` | Original Url |

**Example:**
```httpspec
POST http://localhost:3333/api/short
Content-Type: application/json
{
    "origUrl": "https://nemo.hashnode.dev/an-introduction-to-recursion-using-javascript-ckfgx2nrq001xols17h787f87"
}
```
### Get item
```httpspec
  GET /:id
```

|Parameter|Type|Description|
|:--|:--|:--|
|`id`|`string`|Unique URL Code|

**Example:**
```httpspec
GET http://localhost:3333/SLiCKEXdn
```


The API is tested with curl.
