const express = require("express");
const cors = require('cors')
const app = express();
const port =  process.env.PORT || 3000
const ejs = require("ejs");

// Load environment variables
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// CORS
const whitelistSetting = {
  production: process.env.DOMAIN_WHITELIST || [],
  development: [],
}
const whitelist = whitelistSetting[process.env.NODE_ENV] || []
const corsOptions = {
  origin: function (origin, callback) {
    if (!whitelist.length || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions))


// Import mailer service
const sendEmail = require("./services/mailer")({
  to: process.env.SENDER_EMAIL_ADDRESS,
  user: process.env.SENDER_EMAIL_USER,
  pass: process.env.SENDER_EMAIL_PASS,
});

// body parser middleware
app.use(express.json());

// view engine setup
app.set("view engine", "ejs");

// serve static files
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.send({
    service: "Online",
    version: require(__dirname + "/package.json").version,
  });
});

app.post("/send-email", async (req, res) => {
  // Fields validate
  if (!req.body.name || !req.body.email || !req.body.phone || !req.body.subject) {
    return res.status(400).send({
      message: "Missing fields",
    });
  }

  // Render html
  const html = await ejs
    .renderFile(__dirname + "/views/emailTemplate.ejs", {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      date: new Date().toLocaleString(),
    })
    .then((output) => output);

  try {
    sendEmail({
      from: req.body.email,
      subject: `[ติดต่อ] - คุณ ${req.body.name}`,
      content: html,
    });
    res.send({
      message: "Sent success",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
