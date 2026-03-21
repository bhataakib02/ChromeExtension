/**
 * PomodoroSession Model
 * Tracks each Pomodoro work/break session
 */

const mongoose = require("mongoose");

const PomodoroSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["work", "short_break", "long_break"],
            default: "work",
        },
        durationMinutes: { type: Number, required: true }, // planned
        actualMinutes: { type: Number, default: 0 },       // actually completed
        completed: { type: Boolean, default: false },
        startedAt: { type: Date, default: Date.now },
        endedAt: { type: Date },

        // Optional: what was the user working on?
        task: { type: String, default: "" },

        // Active website during this pomodoro
        website: { type: String, default: "" },
    },
    { timestamps: true }
);

PomodoroSessionSchema.index({ userId: 1, startedAt: -1 });

module.exports = mongoose.model("PomodoroSession", PomodoroSessionSchema);
