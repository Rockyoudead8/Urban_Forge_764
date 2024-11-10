const express = require("express")
const app = express()
const usermodel = require("./models/user")
const path = require("path")
const sellermodel = require("./models/seller")
const productmodel = require("./models/inventory")
const Inventory = require("./models/inventory")
require("./auth");
const { create } = require("domain")
const user = require("./models/user")
const multer = require("multer");

const bcrypt = require('bcrypt');
const crypto = require("crypto")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))
app.set('view engine', 'ejs');



const mongoose = require('mongoose');
const passport = require("passport")

app.get("/search", async (req, res) => {
    const searchTerm = req.query.q; // Capture search term from query parameter
    try {
        // Use regex for a case-insensitive match on product name, description, or category
        const results = await Inventory.find({
            $or: [
                { productname: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } },
                { category: { $regex: searchTerm, $options: "i" } }
            ]
        });
        
        res.render("searchResults.ejs", { results, searchTerm }); // Render search results
    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).send("Server error during search");
    }
});



app.get("/auth/google",passport.authenticate('google',{scope : ['email','profile']}))

app.get("/cart", async(req, res) => {
    let allproducts = await productmodel.find()
    res.render("cart.ejs",{allproducts})
})
app.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if productId is a valid ObjectId
        let product;
        if (mongoose.Types.ObjectId.isValid(productId)) {
            // Try to find by _id
            product = await Inventory.findById(productId);
        }

        // If not found, attempt to find by productid
        if (!product) {
            product = await Inventory.findOne({ productid: productId });
        }

        if (!product) return res.status(404).send("Product not found");

        res.render('buy.ejs', { product });
    } catch (error) {
        console.log("Error fetching product:", error);
        res.status(500).send("Server error");
    }
});

  

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

app.get("/buy", async (req, res) => {
    let details = await info.find()
    res.render("buy.ejs",{details})

})

app.get("/payment",(req,res)=>{
    res.render("payment.ejs")
})

app.get('/products/:category?', async (req, res) => {
    try {
        const category = req.params.category;
        console.log("Category:", category); // Debugging line
        const query = category ? { category: new RegExp(`^${category}$`, 'i') } : {}; // Case-insensitive search
        const products = await Inventory.find(query);

        if (!products || products.length === 0) {
            return res.status(404).send("No products found");
        }

        res.render('product.ejs', { products, category });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("An error occurred while fetching products.");
    }
});


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
    const imagePath = req.file ? `/images.upload/${req.file.filename}` : null;
    

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
            story: req.body.story,
            image: imagePath
        });
        // Modify redirection based on a condition or parameter if needed
        res.redirect("/products");
    } else {
        res.redirect("/admin"); // If the product already exists
    }
    

})
app.get("/userpanel", (req, res) => {
    res.render("userpanel.ejs")
})

app.post("/create", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
    let createduser = await usermodel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    res.redirect("/userpanel")
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
    res.render("login.ejs")
})

app.get("/index", (req, res) => {
    res.redirect("/seller-signup")
})


app.get("/wishlist", (req, res) => {
    res.render("wishlist.ejs")
})

app.get("/profile", (req, res) => {
    res.render("profile.ejs")
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
    return res.redirect("/userpanel");
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