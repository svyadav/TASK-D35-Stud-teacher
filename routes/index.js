var express = require("express");
var router = express.Router();
const { mongodb, dbName, dbUrl, MongoClient } = require("../dbConfig");
const client = new MongoClient(dbUrl);

/* GET home page. */

//To get all students data
router.get("/all-students", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db.collection("student").find().toArray();
    res.send({
      statudCode: 200,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Internal server error" });
  } finally {
    client.close();
  }
});

//To get all mentors
router.get("/all-mentors", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db.collection("mentor").find().toArray();
    res.send({
      statudCode: 200,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Internal server error" });
  } finally {
    client.close();
  }
});

//To get mentor details of required student

router.post("/mentor", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db
      .collection("student")
      .findOne({ studentName: req.body.studentName });
    res.send({
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    res.json({ message: "Internal server error" });
  } finally {
    client.close();
  }
});

//To get student detail of required mentor

router.post("/students", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db
      .collection("mentor")
      .findOne({ mentorName: req.body.mentorName });
    res.send({
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Internal server error" });
  } finally {
    client.close();
  }
});

//To add mentor

router.post("/add-mentor", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db.collection("mentor").insertOne(req.body);
    if (req.body.mentorStudents) {
      req.body.mentorStudents.map(async (e) => {
        const stud = await db
          .collection("student")
          .updateOne(
            { studentName: e },
            { $set: { studentMentor: req.body.mentorName } }
          );
      });
    }
    res.send({
      statusCode: 200,
      data: user,
      message: "Mentor added successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 400,
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

// To add student

router.post("/add-student", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const user = await db.collection("student").insertOne(req.body);
    if (req.body.studentMentor) {
      const men = await db
        .collection("mentor")
        .findOne({ mentorName: req.body.studentMentor });
      men.mentorStudents.push(req.body.studentName);
      const update = await db
        .collection("mentor")
        .updateOne(
          { mentorName: req.body.studentMentor },
          { $set: { mentorStudents: men.mentorStudents } }
        );
    }
    res.send({
      statusCode: 200,
      message: "Student added successfully",
    });
  } catch (error) {
    console.log(error),
      res.send({
        statusCode: 400,
        message: "Internal server error",
      });
  } finally {
    client.close();
  }
});



// To assign Students

router.post("/assign-students", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    if (req.body.mentorStudents) {
      req.body.mentorStudents.map(async (e) => {
        const stu = await db
          .collection("student")
          .updateOne(
            { studentName: e },
            { $set: { studentMentor: req.body.mentorName } }
          );
      });
    }
    if (req.body.mentorName) {
      const men = await db
        .collection("mentor")
        .findOne({ mentorName: req.body.mentorName });
      req.body.mentorStudents.map((i) => {
        men.mentorStudents.push(i);
      });
      const update = await db
        .collection("mentor")
        .updateOne(
          { mentorName: req.body.mentorName },
          { $set: { mentorStudents: men.mentorStudents } }
        );
    }
    res.send({
      statusCode: 200,
      message: "Student and Mentor mapped successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 500,
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});

//To change mentor

router.post("/change-mentor", async (req, res) => {
  await client.connect();
  try {
    const db = await client.db(dbName);
    const men = await db
      .collection("mentor")
      .findOne({ mentorName: req.body.oldMentor });
    men.mentorStudents.splice(
      men.mentorStudents.indexOf(req.body.studentName),
      1
    );
    const update = await db
      .collection("mentor")
      .updateOne(
        { mentorName: req.body.oldMentor },
        { $set: { mentorStudents: men.mentorStudents } }
      );
    const user = await db
      .collection("student")
      .updateOne(
        { studentName: req.body.studentName },
        { $set: { studentMentor: req.body.mentorName } }
      );
    const newmen = await db
      .collection("mentor")
      .findOne({ mentorName: req.body.mentorName });
    newmen.mentorStudents.push(req.body.studentName);
    const newUpdate = await db
      .collection("mentor")
      .updateOne(
        { mentorName: req.body.mentorName },
        { $set: { mentorStudents: newmen.mentorStudents } }
      );
      res.send({
        statusCode:200,
        message:"Mentor chnaged successfully"
      })
  } catch (error) {
    console.log(error);
    res.send({
      statusCode: 500,
      message: "Internal server error",
    });
  } finally {
    client.close();
  }
});
module.exports = router;
