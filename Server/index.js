import express from "express";
import mongoose from "mongoose";
const app = express()
const port = 5000;

app.use(express.json());

// Database connection with MongoDB
mongoose.connect("mongodb+srv://aman:wpp1rMUadWrsyGHm@cluster0.diz3ihe.mongodb.net/")

    .then(() => console.log("MongoDB connected…"))
    .catch((err) => console.log(err));

const CourseSchema = new mongoose.Schema({  // CourseSchema
    cse: [
        {
            uid: Number,
            sem1: Number,
            sem2: Number,
            cgpa: Number,
        },
    ],
});

const CoursesDocument = mongoose.model("Subjects", CourseSchema);

// Routes

// GET: Retrieve all students
app.get("/students", async (req, res) => {
    try {
        const doc = await CoursesDocument.findOne();
        res.json(doc.cse);
    } catch (error) {
        res.status(500).send(error);
    }
});

// POST: Add a new student
app.post("/students", async (req, res) => {
    try {
        const newStudent = req.body; // Assuming the request body contains the student data
        const doc = await CoursesDocument.findOne();
        doc.cse.push(newStudent);
        await doc.save();
        res.json(doc.cse);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PUT: Update a student by UID
app.put("/students/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const doc = await CoursesDocument.findOneAndUpdate(
            { "cse.uid": parseInt(uid) },
            { $set: { "cse.$": { ...req.body, uid: parseInt(uid) } } },
            { new: true }
        );
        if (doc) {
            res.json(doc.cse);
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH: Update a student by UID
app.patch("/students/v1/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const updatedFields = req.body; // Assuming the request body contains the fields to be updated
        const doc = await CoursesDocument.findOne();
        const studentIndex = doc.cse.findIndex(student => student.uid === parseInt(uid));

        if (studentIndex !== -1) {
            doc.cse[studentIndex] = { ...doc.cse[studentIndex], ...updatedFields };
            await doc.save();
            res.json(doc.cse);
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// DELETE: Delete a student by UID
app.delete("/students/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const doc = await CoursesDocument.findOne();
        doc.cse = doc.cse.filter(student => student.uid !== parseInt(uid));
        await doc.save();
        res.json(doc.cse);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Catch-all route for invalid routes
app.get("/*", (req, res) => {
    const possibleRoutes = [
        "/students",
        "/students/:uid",
        // Add other routes as needed
    ];
    const message = `You are on the wrong route. Here's the list of possible routes:\n${possibleRoutes.join("\n")}`;
    res.send(message);
    console.log("You are on an invalid route:", req.path);
});

app.listen(port, (error) => {
    if (!error) {
        console.log(`Server is running on http://localhost:${port}`);
    } else {
        console.log("Error :" + error);
    }
});
