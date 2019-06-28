const express = require('express')
const sql = require("./sqlhandler");
const {
    SHA3
} = require('sha3')


const app = express()
const port = process.env.PORT || 80
console.log("Started!")


app.set("view engine", "ejs")
app.use(express.static('./assets/'));
app.use(express.urlencoded());


app.get("/",function(req,res){
    res.render("home")
})
app.get("/:id",function(req,res){
    res.render("config",{
        id: req.params.id
    })
})




app.get('/settings/:id', function (req, res) {
    sql.run(`select * from servers where id='${req.params.id}'`, function (data) {
        try {
            res.send(JSON.parse((data[0]["settings"]))).end()
        } catch (err) {
            res.send("invalid id").end()
        }
    })
})

app.post("/set/:id", function (req, res) {

    if (!req.body.password)
        res.send("please send password").end()
    else {
        if (checkjson(req.body.settings)) {

            set(req.params.id, req.body.password, req.body.settings, function (msg) {
                res.send(msg).end()
            })
        } else {
            res.send("please send a valid JSON settings string").end()
        }
    }
})

app.get("/servers/", function (req, res) {
    if (req.query.password) {
        var hash = new SHA3(256);
        hash.update(req.query.password)
        if (hash.digest("hex") == "5ea27761bbc70b4583c99f6beceec3098c53a80c143bc0623e3a4bb8ddc73108") {
            if (req.query.servers) {
                var servers = JSON.parse(req.query.servers)
                sql.run("select * from servers", function (data) {
                    data.forEach(server => {
                        if (!servers.includes(server["id"])) {
                            console.log(server["id"])
                            sql.run(`delete from servers where id='${server["id"]}'`, function (data) {
                                
                            })
                        }
                    });

                    res.send("ok")
                })
            } else {
                res.send("L")
            }
        } else {
            res.send("invalid password")
        }
    } else {
        res.send("pls send password")
    }
})



function set(id, password, json, callback) {

    sql.run(`select * from servers where id='${id}'`, function (data) {

        var hash = new SHA3(256);
        hash.update(password)
        var hex = hash.digest("hex");
        if (data.length == 0) {
            sql.run(`insert into servers values ('${id}', '${hex}', '${json}')`, function (data) {
                callback("created new field")
            })
        } else {
            if (hex == data[0]["password"]) {

                sql.run(`update servers set settings='${json}' where id='${id}'`, function () {
                    callback("updated field")
                })
            } else
                callback("invalid password")
        }
    })
}


app.listen(port, () => console.log(`listening on port ${port}!`))







function checkjson(str) {
    try {
        a = JSON.parse(str);
        return a;
    } catch (err) {
        return false;
    }
}