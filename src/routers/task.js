const express = require("express")
const Task = require("../models/task")
const auth = require('../middleware/auth')
const router = new express.Router()

router.post("/tasks", auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201)
        res.send(task);
    } catch (error) {
        res.status(400)
        res.send(error);
    }
})

router.delete("/tasks/:id", auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            res.status(404)
            return res.send()
        }

        res.send(task)
    } catch (error) {
        res.status(500)
        res.send(error)
    }
})

router.get("/tasks", auth, async (req,res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed = "true"
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        // const allTasks = await Task.find({owner: req.user._id})
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (e) {
        res.status(400)
        res.send(e)
    }
})

router.patch("/tasks/:id", auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every(el => allowedUpdates.includes(el))

    if (!isValidOperation) {
        res.status(400)
        return res.send({ "error": "Invalid updates"})
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        // const task = await Task.findById(req.params.id)

        if (!task) {
            res.status(404)
            return res.send()
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (error) {
        res.status(400)
        res.send(error)
    }

})

router.get("/tasks/:id", auth, async (req,res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id , owner: req.user._id})

        if (!task) {
            res.status(404)
            return res.send()
        }
        res.send(task);
    } catch (error) {
        res.status(500)
        res.send(error)
    }
})

module.exports = router