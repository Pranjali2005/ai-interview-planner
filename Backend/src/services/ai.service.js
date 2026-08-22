const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

// ==========================================
// GOOGLE AI
// ==========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// ==========================================
// ZOD SCHEMAS
// ==========================================

const questionSchema = z.object({
    question: z.string().min(1),
    intention: z.string().min(1),
    answer: z.string().min(1)
});

const skillGapSchema = z.object({
    skill: z.string().min(1),
    severity: z.enum(["low", "medium", "high"])
});

const preparationDaySchema = z.object({
    day: z.number().int().min(1),
    focus: z.string().min(1),
    tasks: z.array(z.string().min(1)).min(1)
});

const interviewReportSchema = z.object({
    title: z.string().min(1),

    matchScore: z.number().min(0).max(100),

    technicalQuestions: z
        .array(questionSchema)
        .min(8),

    behavioralQuestions: z
        .array(questionSchema)
        .min(5),

    skillGaps: z
        .array(skillGapSchema)
        .min(3),

    preparationPlan: z
        .array(preparationDaySchema)
        .min(7)
});

// ==========================================
// HELPER
// ==========================================

function safeString(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value).trim();
}

// ==========================================
// NORMALIZE QUESTION
// ==========================================

function normalizeQuestion(item) {

    if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
    }

    const question = safeString(item.question);
    const intention = safeString(item.intention);
    const answer = safeString(item.answer);

    if (!question || !intention || !answer) {
        return null;
    }

    return {
        question,
        intention,
        answer
    };
}

// ==========================================
// NORMALIZE QUESTIONS
// ==========================================

function normalizeQuestions(data) {

    if (!Array.isArray(data)) {
        return [];
    }

    const result = [];

    for (const item of data) {

        const normalized = normalizeQuestion(item);

        if (normalized) {
            result.push(normalized);
        }
    }

    return result;
}

// ==========================================
// NORMALIZE SKILL GAPS
// ==========================================

function normalizeSkillGaps(data) {

    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map(item => {

            if (
                !item ||
                typeof item !== "object" ||
                Array.isArray(item)
            ) {
                return null;
            }

            const skill = safeString(item.skill);

            let severity = safeString(
                item.severity,
                "medium"
            ).toLowerCase();

            if (
                !["low", "medium", "high"].includes(
                    severity
                )
            ) {
                severity = "medium";
            }

            if (!skill) {
                return null;
            }

            return {
                skill,
                severity
            };
        })
        .filter(Boolean);
}

// ==========================================
// NORMALIZE PREPARATION PLAN
// ==========================================

function normalizePreparationPlan(data) {

    if (!Array.isArray(data)) {
        return [];
    }

    const result = [];

    for (const item of data) {

        if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item)
        ) {
            continue;
        }

        const day = Number(item.day);

        const focus = safeString(
            item.focus
        );

        let tasks = [];

        if (Array.isArray(item.tasks)) {

            tasks = item.tasks
                .map(task => safeString(task))
                .filter(Boolean);

        }

        if (
            !Number.isInteger(day) ||
            day < 1 ||
            !focus ||
            tasks.length === 0
        ) {
            continue;
        }

        result.push({
            day,
            focus,
            tasks
        });
    }

    // Sort by day
    result.sort(
        (a, b) => a.day - b.day
    );

    return result;
}

// ==========================================
// VALIDATE REPORT
// ==========================================

function validateInterviewReport(report) {

    const result =
        interviewReportSchema.safeParse(report);

    if (!result.success) {

        console.error(
            "========== INVALID AI REPORT =========="
        );

        console.error(
            result.error.format()
        );

        console.error(
            "======================================="
        );

        throw new Error(
            "AI generated an invalid interview report structure."
        );
    }

    return result.data;
}

// ==========================================
// GENERATE INTERVIEW REPORT
// ==========================================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `

You are an expert technical interviewer and senior career coach.

Your task is to create an interview preparation report for the candidate.

You MUST return ONLY valid JSON.

DO NOT return markdown.

DO NOT return explanations outside JSON.

DO NOT flatten objects.

DO NOT return arrays of strings.

Every technical question MUST be an object.

Every behavioral question MUST be an object.

Every preparation day MUST be an object.

========================================
REQUIRED JSON STRUCTURE
========================================

{
    "title": "Actual Job Title",

    "matchScore": 88,

    "technicalQuestions": [
        {
            "question": "What is the virtual DOM in React?",
            "intention": "To evaluate the candidate's understanding of React rendering.",
            "answer": "The virtual DOM is a lightweight representation of the real DOM..."
        }
    ],

    "behavioralQuestions": [
        {
            "question": "Tell me about yourself.",
            "intention": "To evaluate communication skills and career background.",
            "answer": "I am a final-year engineering student..."
        }
    ],

    "skillGaps": [
        {
            "skill": "AWS deployment",
            "severity": "medium"
        }
    ],

    "preparationPlan": [
        {
            "day": 1,
            "focus": "React Fundamentals",
            "tasks": [
                "Review components and props.",
                "Practice React hooks.",
                "Build a small React application."
            ]
        }
    ]
}

========================================
TECHNICAL QUESTIONS
========================================

Generate at least 8 technical questions.

The questions MUST be directly related to:

- Job description
- Candidate resume
- Candidate projects
- Candidate skills
- Required technologies
- DSA
- APIs
- Databases
- Authentication
- System design where relevant

For every question:

question:
The actual interview question.

intention:
Explain what the interviewer is trying to evaluate.

answer:
Give a strong interview-ready answer.

IMPORTANT:

The answer must NOT be instructions like:

"Prepare a clear answer."

The answer must actually answer the question.

For example:

BAD:

{
    "question": "What is JWT?",
    "intention": "Tests authentication.",
    "answer": "Prepare JWT."
}

GOOD:

{
    "question": "What is JWT and how is it used for authentication?",
    "intention": "Tests the candidate's understanding of token-based authentication.",
    "answer": "JWT stands for JSON Web Token. It is commonly used for stateless authentication. After successful login, the server generates a signed token and the client sends it with subsequent requests. The server verifies the token before allowing access to protected resources."
}

========================================
BEHAVIORAL QUESTIONS
========================================

Generate at least 5 behavioral questions.

Make them relevant to the candidate's:

- education
- projects
- teamwork
- challenges
- leadership
- communication
- problem solving
- failures
- career goals

Every answer must be an actual sample interview answer.

Use the STAR approach where appropriate.

========================================
SKILL GAPS
========================================

Identify at least 3 genuine skill gaps.

Only include skills that are:

- Required by the job description but missing from the resume
OR
- Important for the role but weakly demonstrated

Use only:

"low"
"medium"
"high"

for severity.

========================================
PREPARATION ROADMAP
========================================

Create a 7-day interview preparation roadmap.

IMPORTANT:

Exactly one object represents one day.

Example:

{
    "day": 1,
    "focus": "React & Frontend",
    "tasks": [
        "Review React hooks.",
        "Practice state management.",
        "Build a small React component."
    ]
}

DO NOT return:

[
    "day",
    "1",
    "focus",
    "React & Frontend"
]

DO NOT return:

[
    "Day 1",
    "React & Frontend",
    "tasks"
]

Each day MUST have:

- day
- focus
- tasks

The tasks MUST be an array.

========================================
CANDIDATE RESUME
========================================

${resume}

========================================
CANDIDATE SELF DESCRIPTION
========================================

${selfDescription}

========================================
JOB DESCRIPTION
========================================

${jobDescription}

========================================

Return ONLY JSON.

`;


    try {

        const response =
            await ai.models.generateContent({

                model: "gemini-3-flash-preview",

                contents: prompt,

                config: {
                    responseMimeType:
                        "application/json",

                    responseSchema: {
                        type: "OBJECT",

                        properties: {

                            title: {
                                type: "STRING"
                            },

                            matchScore: {
                                type: "NUMBER"
                            },

                            technicalQuestions: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",

                                    properties: {
                                        question: {
                                            type: "STRING"
                                        },

                                        intention: {
                                            type: "STRING"
                                        },

                                        answer: {
                                            type: "STRING"
                                        }
                                    },

                                    required: [
                                        "question",
                                        "intention",
                                        "answer"
                                    ]
                                }
                            },

                            behavioralQuestions: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",

                                    properties: {
                                        question: {
                                            type: "STRING"
                                        },

                                        intention: {
                                            type: "STRING"
                                        },

                                        answer: {
                                            type: "STRING"
                                        }
                                    },

                                    required: [
                                        "question",
                                        "intention",
                                        "answer"
                                    ]
                                }
                            },

                            skillGaps: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",

                                    properties: {
                                        skill: {
                                            type: "STRING"
                                        },

                                        severity: {
                                            type: "STRING"
                                        }
                                    },

                                    required: [
                                        "skill",
                                        "severity"
                                    ]
                                }
                            },

                            preparationPlan: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",

                                    properties: {

                                        day: {
                                            type: "INTEGER"
                                        },

                                        focus: {
                                            type: "STRING"
                                        },

                                        tasks: {
                                            type: "ARRAY",
                                            items: {
                                                type: "STRING"
                                            }
                                        }
                                    },

                                    required: [
                                        "day",
                                        "focus",
                                        "tasks"
                                    ]
                                }
                            }
                        },

                        required: [
                            "title",
                            "matchScore",
                            "technicalQuestions",
                            "behavioralQuestions",
                            "skillGaps",
                            "preparationPlan"
                        ]
                    }
                }
            });


        // ==========================================
        // PARSE AI RESPONSE
        // ==========================================

        let aiResult;

        try {

            aiResult =
                JSON.parse(response.text);

        } catch (error) {

            console.error(
                "========== AI JSON ERROR =========="
            );

            console.error(
                response.text
            );

            console.error(
                "==================================="
            );

            throw new Error(
                "AI returned invalid JSON."
            );
        }


        // ==========================================
        // NORMALIZE
        // ==========================================

        const normalizedReport = {

            title:
                safeString(
                    aiResult.title,
                    "Full Stack Developer"
                ),

            matchScore:
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            aiResult.matchScore
                        ) || 0
                    )
                ),

            technicalQuestions:
                normalizeQuestions(
                    aiResult.technicalQuestions
                ),

            behavioralQuestions:
                normalizeQuestions(
                    aiResult.behavioralQuestions
                ),

            skillGaps:
                normalizeSkillGaps(
                    aiResult.skillGaps
                ),

            preparationPlan:
                normalizePreparationPlan(
                    aiResult.preparationPlan
                )
        };


        // ==========================================
        // CHECK COUNTS
        // ==========================================

        if (
            normalizedReport
                .technicalQuestions
                .length < 8
        ) {

            throw new Error(
                "AI generated fewer than 8 valid technical questions."
            );
        }

        if (
            normalizedReport
                .behavioralQuestions
                .length < 5
        ) {

            throw new Error(
                "AI generated fewer than 5 valid behavioral questions."
            );
        }

        if (
            normalizedReport
                .skillGaps
                .length < 3
        ) {

            throw new Error(
                "AI generated fewer than 3 valid skill gaps."
            );
        }

        if (
            normalizedReport
                .preparationPlan
                .length < 7
        ) {

            throw new Error(
                "AI generated fewer than 7 valid preparation days."
            );
        }


        // ==========================================
        // VALIDATE FINAL OBJECT
        // ==========================================

        const finalReport =
            validateInterviewReport(
                normalizedReport
            );


        // ==========================================
        // DEBUG
        // ==========================================

        console.log(
            "========== FINAL AI REPORT =========="
        );

        console.log(
            JSON.stringify(
                finalReport,
                null,
                2
            )
        );

        console.log(
            "====================================="
        );


        return finalReport;

    } catch (error) {

        console.error(
            "Error generating interview report:",
            error
        );

        throw error;
    }
}


// ==========================================
// GENERATE PDF FROM HTML
// ==========================================

async function generatePdfFromHtml(
    htmlContent
) {

    let browser;

    try {

        browser =
            await puppeteer.launch({

                headless: true,

                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            });


        const page =
            await browser.newPage();


        await page.setContent(
            htmlContent,
            {
                waitUntil:
                    "networkidle0"
            }
        );


        const pdfBuffer =
            await page.pdf({

                format: "A4",

                printBackground: true,

                margin: {
                    top: "20mm",
                    bottom: "20mm",
                    left: "15mm",
                    right: "15mm"
                }
            });


        return pdfBuffer;

    } finally {

        if (browser) {
            await browser.close();
        }
    }
}


// ==========================================
// GENERATE RESUME PDF
// ==========================================

async function generateResumePdf({

    resume,
    selfDescription,
    jobDescription

}) {

    const resumePdfSchema =
        z.object({
            html: z.string()
        });


    const prompt = `

Create a professional ATS-friendly resume.

Candidate Resume:

${resume}

Candidate Self Description:

${selfDescription}

Job Description:

${jobDescription}

Return ONLY JSON.

Required format:

{
    "html": "FULL HTML HERE"
}

Requirements:

- Professional resume
- ATS friendly
- 1-2 pages
- Simple clean layout
- No unnecessary graphics
- Highlight relevant skills
- Highlight relevant projects
- Match the resume to the job description
- Use clean HTML and CSS
- Do not mention AI
- Do not invent work experience
- Do not invent education
- Do not invent projects
- Do not invent certifications

`;


    const response =
        await ai.models.generateContent({

            model: "gemini-3-flash-preview",

            contents: prompt,

            config: {

                responseMimeType:
                    "application/json",

                responseSchema: {

                    type: "OBJECT",

                    properties: {

                        html: {
                            type: "STRING"
                        }

                    },

                    required: [
                        "html"
                    ]
                }
            }
        });


    let jsonContent;

    try {

        jsonContent =
            JSON.parse(
                response.text
            );

    } catch (error) {

        console.error(
            "Invalid resume AI response:",
            response.text
        );

        throw new Error(
            "AI returned invalid resume data."
        );
    }


    const parsed =
        resumePdfSchema.safeParse(
            jsonContent
        );


    if (!parsed.success) {

        throw new Error(
            "Invalid resume HTML returned by AI."
        );
    }


    if (!parsed.data.html.trim()) {

        throw new Error(
            "AI did not return resume HTML."
        );
    }


    return await generatePdfFromHtml(
        parsed.data.html
    );
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    generateInterviewReport,

    generateResumePdf

};