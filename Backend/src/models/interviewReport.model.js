const mongoose = require("mongoose");

// ======================================================
// TECHNICAL QUESTION SCHEMA
// ======================================================

const technicalQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },

        intention: {
            type: String,
            required: true,
            trim: true
        },

        answer: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);


// ======================================================
// BEHAVIORAL QUESTION SCHEMA
// ======================================================

const behavioralQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },

        intention: {
            type: String,
            required: true,
            trim: true
        },

        answer: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);


// ======================================================
// SKILL GAP SCHEMA
// ======================================================

const skillGapSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: true,
            trim: true
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true
        }
    },
    {
        _id: false
    }
);


// ======================================================
// PREPARATION PLAN SCHEMA
// ======================================================

const preparationPlanSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true,
            min: 1
        },

        focus: {
            type: String,
            required: true,
            trim: true
        },

        tasks: {
            type: [String],
            default: []
        }
    },
    {
        _id: false
    }
);


// ======================================================
// INTERVIEW REPORT SCHEMA
// ======================================================

const interviewReportSchema = new mongoose.Schema(
    {
        // ------------------------------------------------
        // JOB INFORMATION
        // ------------------------------------------------

        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true
        },

        jobDescription: {
            type: String,
            required: [true, "Job description is required"]
        },


        // ------------------------------------------------
        // CANDIDATE INFORMATION
        // ------------------------------------------------

        resume: {
            type: String,
            default: ""
        },

        selfDescription: {
            type: String,
            default: ""
        },


        // ------------------------------------------------
        // MATCH SCORE
        // ------------------------------------------------

        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },


        // ------------------------------------------------
        // TECHNICAL QUESTIONS
        // ------------------------------------------------

        technicalQuestions: {
            type: [technicalQuestionSchema],
            default: []
        },


        // ------------------------------------------------
        // BEHAVIORAL QUESTIONS
        // ------------------------------------------------

        behavioralQuestions: {
            type: [behavioralQuestionSchema],
            default: []
        },


        // ------------------------------------------------
        // SKILL GAPS
        // ------------------------------------------------

        skillGaps: {
            type: [skillGapSchema],
            default: []
        },


        // ------------------------------------------------
        // PREPARATION PLAN
        // ------------------------------------------------

        preparationPlan: {
            type: [preparationPlanSchema],
            default: []
        },


        // ------------------------------------------------
        // USER
        // ------------------------------------------------

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// PREVENT OverwriteModelError
// ======================================================

const InterviewReport =
    mongoose.models.InterviewReport ||
    mongoose.model("InterviewReport", interviewReportSchema);


// ======================================================
// EXPORT
// ======================================================

module.exports = InterviewReport;