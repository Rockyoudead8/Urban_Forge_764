const express = require("express")
const app = express()
const usermodel = require("./models/user")
const path = require("path")
const sellermodel = require("./models/seller")
const productmodel = require("./models/inventory")
const { create } = require("domain")
const user = require("./models/user")
const multer = require("multer")
const bcrypt = require('bcrypt');
const crypto = require("crypto")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function (err, bytes) {
            const fn = bytes.toString("hex") + path.extname(file.originalname)
            cb(null, fn)
        })

    }
})

const upload = multer({ storage: storage })

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/seller-signup", (req, res) => {
    res.render("seller.ejs")
})

app.get("/products", async (req, res) => {
    let allproducts = await productmodel.find()
    res.render("products.ejs", { allproducts })
})

app.post("/createproduct", upload.single("Image"), async (req, res) => {
    const { productid } = req.body; 

    // Find a user with the given email
    const id = await productmodel.findOne({ productid });

    if (!id) {
        let createdproduct = await productmodel.create({
            // productpic: `/images/uploads/${req.file.filename}`,
            productname: req.body.productname,
            productid: req.body.productid,
            price: req.body.Price,
            quantity: req.body.quantity,
            category: req.body.category,
            size: req.body.size,
            description: req.body.desc,
            story: req.body.story
        })
        res.redirect("/products")
    }
 
    else{
     res.redirect("/admin");
    }
    
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
    res.redirect("/admin")
});

app.get("/admin", (req, res) => {
    res.render("adminpanel.ejs")
})

app.get("/login1", (req, res) => {
    res.render("login1.ejs")
})

app.get("/login", (req, res) => {
    res.redirect("login1")
})

app.get("/index", (req, res) => {
    res.redirect("/seller-signup")
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
    return res.redirect("/admin");
});



app.listen("3000")