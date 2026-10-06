/* const { faker } = require("@faker-js/faker"); */
const express = require("express");
let app = express();

app.use(express.urlencoded({ extended: true }));
const path = require("path");

var methodoverride = require("method-override");;

app.use(methodoverride("_method"));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

let port = 3000;

app.listen(port, () => {
    console.log("app is listening to port", 3000);
})

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta',
    password: 'harsh'
});
let count;
app.get("/", (req, res) => {
    connection.query("select count(*) from user", (err, result) => {
        if (err) {
            throw err;
        }

        count = result[0]["count(*)"];
        res.render("home.ejs", { count })

    })
})

app.get("/userdata", (req, res) => {

    connection.query("select id , username , email from user", (err, result) => {
        if (err) {
            res.send("wrong query");

        }
        res.render("user.ejs", { result });

    })


})
let realpass;
app.get("/userdata/:id/edit", (req, res) => {
    let { id } = req.params;
    connection.query("select id , username , email , password from user where id = ?", id, (err, result) => {
        if (err) {
            res.send("wrong query");

        }

        realpass = result[0].password;
        res.render("edit.ejs", { id, result })
        console.log(realpass);

    })

})

app.patch("/userdata/:id", (req, res) => {
    let { id } = req.params;
    let newusername = req.body.username;
    let pass = req.body.pass;
    if (pass == realpass) {
        connection.query("update user set username = ? where id = ?", [newusername, id], (err, result) => {
            if (err) {
                res.send(err);

            }
            else {
                res.redirect("/userdata");
            }

        })
    }
    else {
        console.log(pass)
        res.send("wrong password");
    }

})
app.get("/userdata/:id/delete", (req, res) => {

    let { id } = req.params;
    connection.query("select * from user where id = ?", id, (err, result) => {
        realpass = result[0].password;
        if (err) {
            res.send("wrong query");
        }
        res.render("delete.ejs", { id, result })
        console.log(realpass);
    })

})
app.delete("/userdata/:id", (req, res) => {
    let { id } = req.params;
    let pass = req.body.pass;
    if (pass == realpass) {
        connection.query("Delete from user where id = ?", id, (err, result) => {
            if (err) {
                res.send("Wrong query");
            }
            else {
                res.redirect("/userdata")
            }

        })
    }
    else {
        res.send("Wrong password")
    }

})
app.get("/newuser", (req, res) => {
    res.render("newuser.ejs");
})
app.post("/newuser", (req, res) => {
    let nid = req.body.id;
    let nuser = req.body.username;
    let nemail = req.body.email;
    let npass = req.body.pass;
    connection.query("select id , username , email from user", (err, result) => {
        if (err) {
            res.send("Wrong query");
        }
        else {
            for (let i = 0; i < result.length; i++) {
                if (nid == result[i].id) {
                    return res.send("Id already taken");
                }
                if (nuser == result[i].username) {
                    return res.send("Username already taken");
                }
                if (nemail == result[i].email) {
                    return res.send("email already taken");
                }

                if (!nemail.endsWith("@gmail.com")) {
                    return res.send("Incorrect form of gmail");
                }

            }
        }
        connection.query("insert into user values(?,?,?,?)", [nid, nuser, nemail, npass], (err, result) => {
                        if (err) {
                            return res.send("Wrong query")
                        }
                        else {
                            res.redirect("/userdata");
                        }
                    })
    })


})



/* let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password()
    ];
}
let data = [];
for(let i = 1 ; i <=100 ; i++){
    data.push(getRandomUser());
}
 */



