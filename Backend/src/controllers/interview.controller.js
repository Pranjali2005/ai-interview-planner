const pdfParse = require("pdf-parse");

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service");

const interviewReportModel =
    require("../models/interviewReport.model");


// ==========================================
// GENERATE INTERVIEW REPORT
// ==========================================

async function generateInterViewReportController(
    req,
    res
) {

    try {


        // ==========================================
        // CHECK USER
        // ==========================================

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                message:
                    "User authentication required."
            });
        }


        // ==========================================
        // CHECK FILE
        // ==========================================

        if (
            req.file &&
            req.file.mimetype !== "application/pdf"
        ) {

            return res.status(400).json({
                message:
                    "Only PDF resumes are allowed."
            });
        }


        // ==========================================
        // CHECK BODY
        // ==========================================

        const {
            selfDescription,
            jobDescription
        } = req.body;


        if (
            !jobDescription ||
            !jobDescription.trim()
        ) {

            return res.status(400).json({
                message:
                    "Job description is required."
            });
        }


        const hasResume = !!req.file;

        const hasSelfDescription =
            !!selfDescription &&
            !!selfDescription.trim();


        if (!hasResume && !hasSelfDescription) {

            return res.status(400).json({
                message:
                    "Either a resume or a self description is required."
            });
        }


        // ==========================================
        // EXTRACT RESUME
        // ==========================================

        let resumeText = "";

        if (hasResume) {

            try {

                const parser =
                    new pdfParse.PDFParse(
                        Uint8Array.from(
                            req.file.buffer
                        )
                    );

                const resumeContent =
                    await parser.getText();

                resumeText =
                    resumeContent?.text || "";

            } catch (error) {

                console.error(
                    "PDF parsing error:",
                    error
                );

                return res.status(400).json({
                    message:
                        "Unable to read the uploaded PDF."
                });
            }


            if (!resumeText.trim() && !hasSelfDescription) {

                return res.status(400).json({
                    message:
                        "Could not extract text from the resume PDF. Please add a self description instead."
                });
            }
        }


        // ==========================================
        // GENERATE AI REPORT
        // ==========================================

        const aiReport =
            await generateInterviewReport({

                resume:
                    resumeText,

                selfDescription:
                    hasSelfDescription
                        ? selfDescription.trim()
                        : "",

                jobDescription:
                    jobDescription.trim()
            });


        // ==========================================
        // CREATE DATABASE OBJECT
        // ==========================================

        const reportData = {

            user:
                req.user.id,

            title:
                aiReport.title ||
                "Full Stack Developer",

            resume:
                resumeText,

            selfDescription:
                hasSelfDescription
                    ? selfDescription.trim()
                    : "",

            jobDescription:
                jobDescription.trim(),

            matchScore:
                Number(
                    aiReport.matchScore
                ) || 0,

            technicalQuestions:
                Array.isArray(
                    aiReport.technicalQuestions
                )
                    ? aiReport.technicalQuestions
                    : [],

            behavioralQuestions:
                Array.isArray(
                    aiReport.behavioralQuestions
                )
                    ? aiReport.behavioralQuestions
                    : [],

            skillGaps:
                Array.isArray(
                    aiReport.skillGaps
                )
                    ? aiReport.skillGaps
                    : [],

            preparationPlan:
                Array.isArray(
                    aiReport.preparationPlan
                )
                    ? aiReport.preparationPlan
                    : []
        };


        // ==========================================
        // SAVE TO DATABASE
        // ==========================================

        const interviewReport =
            await interviewReportModel.create(
                reportData
            );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            message:
                "Interview report generated successfully.",

            interviewReport
        });


    } catch (error) {

        console.error(
            "Error generating interview report:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to generate interview report.",

            error:
                error.message
        });
    }
}


// ==========================================
// GET REPORT BY ID
// ==========================================

async function getInterviewReportByIdController(
    req,
    res
) {

    try {

        const {
            interviewId
        } = req.params;


        const interviewReport =
            await interviewReportModel.findOne({

                _id:
                    interviewId,

                user:
                    req.user.id
            });


        if (!interviewReport) {

            return res.status(404).json({
                message:
                    "Interview report not found."
            });
        }


        return res.status(200).json({

            message:
                "Interview report fetched successfully.",

            interviewReport
        });


    } catch (error) {

        console.error(
            "Error fetching interview report:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to fetch interview report.",

            error:
                error.message
        });
    }
}


// ==========================================
// GET ALL REPORTS
// ==========================================

async function getAllInterviewReportsController(
    req,
    res
) {

    try {

        const interviewReports =
            await interviewReportModel

                .find({
                    user:
                        req.user.id
                })

                .sort({
                    createdAt:
                        -1
                })

                .select(
                    "-resume -selfDescription -jobDescription -__v"
                );


        return res.status(200).json({

            message:
                "Interview reports fetched successfully.",

            interviewReports
        });


    } catch (error) {

        console.error(
            "Error fetching interview reports:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to fetch interview reports.",

            error:
                error.message
        });
    }
}


// ==========================================
// GENERATE RESUME PDF
// ==========================================

async function generateResumePdfController(
    req,
    res
) {

    try {

        const {
            interviewReportId
        } = req.params;


        const interviewReport =
            await interviewReportModel.findOne({

                _id:
                    interviewReportId,

                user:
                    req.user.id
            });


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found."
            });
        }


        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport;


        const pdfBuffer =
            await generateResumePdf({

                resume,

                jobDescription,

                selfDescription
            });


        res.set({

            "Content-Type":
                "application/pdf",

            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`
        });


        return res.send(
            pdfBuffer
        );


    } catch (error) {

        console.error(
            "Error generating resume PDF:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to generate resume PDF.",

            error:
                error.message
        });
    }
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    generateInterViewReportController,

    getInterviewReportByIdController,

    getAllInterviewReportsController,

    generateResumePdfController
};