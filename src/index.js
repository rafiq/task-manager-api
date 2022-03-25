const app = require("./app")
const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
})

/**
 *
 * The project uses both Node.js and MongoDB along with Postman to access all the post, get, update and delete requests made by the user. The Project teaches on how to use routers on server and make use of them to access various functions. The project has a user login and authentication check that only verified users whose information is saved inside the database are able to login.The logged in users can then view their profiles, and further update or delete it. There is also an option to upload a profile picture. Also the person can logout safely from their account. All the monitoring is done with the help of information stored in the Database and the information keeps on updating in the database as when the user performs an action. All this is only possible because a separate 'id' is provided to each component as and when the data is added to the database which helps in tracking of data. The user can also mention various tasks that he/she wants to perform which also gets stored in the database. The postman can work on both the local machine and also work while deploying the app on the server using the two modes i.e dev mode and the browser mode.
 */