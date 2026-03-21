/**
 * Pomodoro Routes
 * GET  /api/pomodoro        — get session history
 * POST /api/pomodoro/start  — start a new session
 * PUT  /api/pomodoro/end    — complete/interrupt a session
 */

const express = require("express");
const router = express.Router();
const PomodoroSession = require("../models/PomodoroSession");
const { protect } = require("../middleware/auth");

router.use(protect);

// GET history
router.get("/", async (req, res, next) => {
    try {
        const history = await PomodoroSession.find({ userId: req.user._id })
            .sort({ startedAt: -1 })
            .limit(50);
        res.json(history);
    } catch (err) {
        next(err);
    }
});

// START a session
router.post("/start", async (req, res, next) => {
    try {
        const { type, durationMinutes, task, website } = req.body;
        const session = await PomodoroSession.create({
            userId: req.user._id,
            type: type || "work",
            durationMinutes: durationMinutes || 25,
            task,
            website,
            startedAt: new Date(),
        });
        res.status(201).json(session);
    } catch (err) {
        next(err);
    }
});

// END/UPDATE a session
router.put("/end/:id", async (req, res, next) => {
    try {
        const { completed, actualMinutes } = req.body;
        const session = await PomodoroSession.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { completed, actualMinutes, endedAt: new Date() },
            { new: true }
        );
        res.json(session);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
