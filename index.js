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


app.get('/settings/:id', function (req, res) {
    sql.run(`select * from servers where id=${req.params.id}`, function (data) {
        try{
            res.setHeader('Content-Type', 'application/json');
            res.send((data[0]["settings"]))
        }
        catch(err){
            res.send("invalid id")
        }
    })
})

app.post("/set/:id", function (req, res) {

    if (!req.body.password)
        res.send("please send password sha3-256").end()
    else {
        if (checkjson(req.body.settings)) {
            
            set(req.params.id, req.body.password, req.body.settings, function (msg) {
                res.send(msg).end()
            })
        }
        else{
            res.send("please send a valid JSON settings string").end()
        }
    }
})



function set(id, password, json, callback) {

    sql.run(`select * from servers where id=${id}`, function (data) {

        var hash = new SHA3(256);
        hash.update(password)
        var hex = hash.digest("hex");
        if (data.length == 0) {
            sql.run(`insert into servers values (${id}, '${hex}', '${json}')`, function (data) {
                callback("created new field")
            })
        } else {
            if (hex == data[0]["password"]) {
                
                sql.run(`update servers set settings='${json}' where id=${id}`, function () {
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