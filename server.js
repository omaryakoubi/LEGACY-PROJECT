//imports and declaration
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const app = express();

//PORT.
const PORT = 8000;

//MULTER PHOTO STORAGE.
const DIR = "./uploads/";

//DATABASE CONNECTION.
const db = require("./database.js");

//DATABASE COLLECTIONS.
const Guide = require("./guideSchema.js");
const User = require("./UserSchema");

//MIDDLEWARES.
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

////////////////////////ROUTES//////////////////////////////////////

//////ALL GUIDE ROUTES///////
// this is for adding a new guide //OK
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, DIR);
  },
  filename: (req, file, callBack) => {
    const filename = file.originalname.toLowerCase().split(" ").join("-");
    callBack(null, "-" + filename);
  },
});

const upload = multer({ storage: storage });
app.post("/guides", upload.single("img"), (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  let newGuide = {
    name: req.body.name,
    description: req.body.description,
    age: req.body.age,
    gender: req.body.gender,
    languages: req.body.languages,
    city: req.body.city,
    img: url + "/uploads/" + req.file.filename,
    phone: req.body.number,
    email: req.body.email,
  };
  Guide.create(newGuide).then((guide) => {
    res.status(201).json(guide);
  });
});

//this is for getting all guides // OK
app.get("/guides", (req, res) => {
  Guide.find({}, (err, guides) => {
    if (err) res.json("can not find this guide at @ /guides");
    else {
      res.status(200).json(guides);
    }
  });
});

//this is for deleting one guide // OK
app.delete("/guides/:name", (req, res) => {
  Guide.findOneAndRemove({ name: req.params.name }, (err, guide) => {
    if (err) res.json("can not find or remove this guide name @ /guides/:name");
    else {
      res.status(201).json(guide);
    }
  });
});

//this for updating a guide// CHECK THE IMG UPDATE AND LANGUAGE ARRAY
app.put("/guides/:name", (req, res) => {
  Guide.findOneAndUpdate({ name: req.params.name }, req.body, (err, guide) => {
    if (err) res.json("can not find or update this guide @/guides/:name");
    else {
      res.status(201).json(guide);
    }
  });
});

//one guide route
// app.route('/guides/:guideId')
//     .get((req, res) => {
//         res.json('GET REQUEST FROM ONE GUIDE ROUTE')
//     })
//     .post((req, res) => {
//         res.json('POST REQUEST FROM ONE GUIDE')
//     })
//     .put((req, res) => {
//         res.json('PUT REQUEST FROM ONE GUIDE')
//     })
//     .delete((req, res) => {
//         res.json('DELETE REQUEST FROM ONE GUIDE')
//     })

//login route
// app.route('/login')
//     .get((req, res) => {
//         res.json(' GET REQUEST LOGIN ROUTES')
//     })
//     .post((req, res) => {
//         res.json('POST REQUEST FROM THE LOGIN')
//     })

//register route
// app.route('/register')
//     .get((req, res) => {
//         res.json('GET REGISTER ROUTE')
//     })
//     .post((req, res) => {
//         res.json('POST REGISTER ROUTE')
//     })

app.post("/signUp", (req, res) => {
  let newUser = {
    userName: req.body.userName,
    addressMail: req.body.addressMail,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  };

  User.findOne({ addressMail: req.body.addressMail })
    .then((user) => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          newUser.password = hash;
          User.create(newUser)
            .then((user) => {
              res.json(user);
            })
            .catch((err) => {
              res.send(err);
            });
        });
      } else {
        res.json("USER ALREADY EXIST");
      }
    })
    .catch((err) => {
      res.send("ERROOOOR");
    });
});

app.post("/LogIn", (req, res) => {
  console.log("mail FRONT", req.body.addressMail);
  console.log("not hashed password front", req.body.password);
  User.findOne({ addressMail: req.body.addressMail }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (!user) {
        res.status(401).send("invalid email");
      } else if (bcrypt.compareSync(req.body.password, user.password)) {
        let payload = { subject: user._id };
        let token = jwt.sign(payload, "secretKey");
        res.status(200).send({ token });
        console.log(token);
      } else {
        res.status(401).send("invalid password");
      }
    }
  });
});

//   User.findOne({ addressMail: req.body.addressMail })
//     .then((user) => {
//       if (user) {
//         if (bcrypt.compareSync(req.body.password, user.password)) {
//           const payload = {
//             addressMail: user.addressMail,
//             userName: user.userName,
//           };
//           let token = jwt.sign(payload, process.env.SECRET_KEY, {
//             expiresIn: 2020,
//           });
//           res.send(token);
//         } else {
//           res.json("WRONG PASSWORD");
//         }
//       } else {
//         res.json("USER NOT FOUND PLEASE CREATE AN ACCOUNT FIRST");
//       }
//     })
//     .catch((err) => {
//       res.send("ERROOOOR");
//     });
// });

//listening th server

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error : ", err);
  }
  console.log(`Local Guide is running on http://localhost:${PORT}`);
});
