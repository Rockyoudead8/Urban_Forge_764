const express = require("express")
const app = express()
const usermodel = require("./models/user")
const path = require("path")
const sellermodel=require("./models/seller")
const { create } = require("domain")
const user = require("./models/user")
const bcrypt = require('bcrypt');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/seller-signup",(req,res)=>{
    res.render("seller.ejs")
})



app.post("/create", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
    let createduser = await usermodel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    res.redirect("/")
});

app.post("/createseller", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
    let createdseller = await sellermodel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    res.redirect("/seller-signup")
});

app.get("/login1",(req,res)=>{
    res.render("login1.ejs")
})

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.post("/read", async (req, res) => {
    const { email, password } = req.body; // Get email and password from the request body

    // Find a user with the given email
    const user = await usermodel.findOne({ email });

    if (!user) {
        return res.render("login.ejs", {
            error: "Invalid username or password",
        });
    }

    // Check if the provided password matches the stored password
    // Assuming you're using bcrypt for password hashing
    const isMatch = await bcrypt.compare(password, user.password); 

    if (!isMatch) {
        return res.render("login.ejs", {
            error: "Invalid username or password",
        });
    }

    // If credentials are valid, redirect to the main page
    return res.redirect("/");
});

app.post("/sread", async (req, res) => {
    const { email, password } = req.body; // Get email and password from the request body

    // Find a user with the given email
    const seller = await sellermodel.findOne({ email });

    if (!seller) {
        return res.render("login1.ejs", {
            error: "Invalid username or password",
        });
    }

    // Check if the provided password matches the stored password
    // Assuming you're using bcrypt for password hashing
    const isMatch = await bcrypt.compare(password, seller.password); 

    if (!isMatch) {
        return res.render("login1.ejs", {
            error: "Invalid username or password",
        });
    }

    // If credentials are valid, redirect to the main page
    return res.redirect("/seller-signup");
});



app.listen("3000")