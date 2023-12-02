const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect("mongodb+srv://brooksmslaski:N6v9ee0TjsOAOiqC@cluster0.uasnjxl.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect to mongodb...", err));


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


const teamSchema = new mongoose.Schema({
    name: String,
    city: String,
    logo: String,
    superBowlWins: String,
    players: [String],
    stadium: String,
  });


const Team = mongoose.model("Team", teamSchema);


app.get("/api/teams", (req, res) => {
    getTeams(res);
});

const getTeams = async (res) => {
    const teams = await Team.find();
    res.send(teams);
  };

app.post("/api/teams", upload.single("img"), (req, res) => {
    const result = validateTeam(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const team = new Team({
        name: req.body.name,
        city: req.body.city,
        logo: req.body.logo,
        superBowlWins: req.body.superBowlWins,
        players: req.body.players.split(","),
        stadium: req.body.stadium,
    });

    if (req.file) {
        team.logo = "images/" + req.file.filename;
      }

      createTeam(team, res);
});

const createTeam = async (team, res) => {
    const result = await team.save();
    res.send(team);
  };


app.put("/api/teams/:id", upload.single("img"), (req, res) => {
    const result = validateTeam(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

updateTeam(req, res);
});


const updateTeam = async (req, res) => {
    let fieldsToUpdate = {
        name: req.body.name,
        city: req.body.city,
        logo: req.body.logo,
        superBowlWins: req.body.superBowlWins,
        players: req.body.players.split(","),
        stadium: req.body.stadium,
    };

    if (req.file) {
        fieldsToUpdate.logo = "images/" + req.file.filename;
      }

    const result = await Team.updateOne({ _id: req.params.id }, fieldsToUpdate);
    const team = await Team.findById(req.params.id);
    res.send(team);
    };

    app.delete("/api/teams/:id", upload.single("img"), (req, res) => {
        removeTeam(res, req.params.id);
    });

    const removeTeam = async (res, id) => {
        const team = await Team.findByIdAndDelete(id);
        res.send(team);
    };

const validateTeam = (team) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        players: Joi.allow(""),
        name: Joi.string().min(3).required(),
        city: Joi.string().min(3).required(),
        logo: Joi.string().min(3).required(),
        superBowlWins: Joi.number().min(0).required(),
        stadium: Joi.string().min(3).required(),
    });

    return schema.validate(team);
};

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});