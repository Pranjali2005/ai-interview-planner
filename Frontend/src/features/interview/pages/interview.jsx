import React, {
    useState,
    useEffect
} from "react";

import "../style/interview.scss";

import { useInterview } from "../hooks/useInterview.js";
import LoadingScreen from "../../../components/common/LoadingScreen";

import {
    useParams
} from "react-router";


// ==========================================
// NAVIGATION
// ==========================================

const NAV_ITEMS = [

    {
        id: "technical",
        label: "Technical Questions",

        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        )
    },

    {
        id: "behavioral",
        label: "Behavioral Questions",

        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },

    {
        id: "roadmap",
        label: "Road Map",

        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
        )
    }
];


// ==========================================
// QUESTION CARD
// ==========================================

const QuestionCard = ({
    item,
    index
}) => {

    const [
        open,
        setOpen
    ] = useState(false);


    return (

        <div className="q-card">

            <div
                className="q-card__header"

                onClick={() =>
                    setOpen(
                        previous =>
                            !previous
                    )
                }
            >

                <span className="q-card__index">
                    Q{index + 1}
                </span>


                <p className="q-card__question">
                    {item.question}
                </p>


                <span
                    className={
                        `q-card__chevron ${
                            open
                                ? "q-card__chevron--open"
                                : ""
                        }`
                    }
                >

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >

                        <polyline points="6 9 12 15 18 9" />

                    </svg>

                </span>

            </div>


            {open && (

                <div className="q-card__body">

                    <div className="q-card__section">

                        <span className="q-card__tag q-card__tag--intention">
                            Intention
                        </span>

                        <p>
                            {item.intention}
                        </p>

                    </div>


                    <div className="q-card__section">

                        <span className="q-card__tag q-card__tag--answer">
                            Model Answer
                        </span>

                        <p>
                            {item.answer}
                        </p>

                    </div>

                </div>

            )}

        </div>
    );
};


// ==========================================
// ROADMAP DAY
// ==========================================

const RoadMapDay = ({
    day
}) => (

    <div className="roadmap-day">

        <div className="roadmap-day__header">

            <span className="roadmap-day__badge">
                Day {day.day}
            </span>

            <h3 className="roadmap-day__focus">
                {day.focus}
            </h3>

        </div>


        <ul className="roadmap-day__tasks">

            {(day.tasks || []).map(
                (task, index) => (

                    <li key={index}>

                        <span className="roadmap-day__bullet" />

                        {task}

                    </li>

                )
            )}

        </ul>

    </div>
);


// ==========================================
// MAIN COMPONENT
// ==========================================

const Interview = () => {

    const [
        activeNav,
        setActiveNav
    ] = useState("technical");


    const {
        report,
        getReportById,
        loading,
        getResumePdf
    } = useInterview();


    const {
        interviewId
    } = useParams();


    useEffect(() => {

        if (interviewId) {

            getReportById(
                interviewId
            );
        }

    }, [interviewId]);


    // ==========================================
    // LOADING
    // ==========================================

    if (
        loading ||
        !report
    ) {

        return (
            <LoadingScreen label="Loading your interview plan" />
        );
    }


    // ==========================================
    // SAFE DATA
    // ==========================================

    const technicalQuestions =
        Array.isArray(
            report.technicalQuestions
        )
            ? report.technicalQuestions
            : [];


    const behavioralQuestions =
        Array.isArray(
            report.behavioralQuestions
        )
            ? report.behavioralQuestions
            : [];


    const preparationPlan =
        Array.isArray(
            report.preparationPlan
        )
            ? report.preparationPlan
            : [];


    const skillGaps =
        Array.isArray(
            report.skillGaps
        )
            ? report.skillGaps
            : [];


    const matchScore =
        Number(
            report.matchScore
        ) || 0;


    // ==========================================
    // SCORE COLOR
    // ==========================================

    const scoreColor =

        matchScore >= 80
            ? "score--high"

            : matchScore >= 60
                ? "score--mid"

                : "score--low";


    // ==========================================
    // SCORE MESSAGE
    // ==========================================

    const scoreMessage =

        matchScore >= 80
            ? "Strong match for this role"

            : matchScore >= 60
                ? "Good match with some areas to improve"

                : "Several areas need improvement";


    return (

        <div className="interview-page">

            <div className="interview-layout">


                {/* ==================================
                    LEFT NAVIGATION
                ================================== */}

                <nav className="interview-nav">

                    <div className="nav-content">

                        <p className="interview-nav__label">
                            Sections
                        </p>


                        {NAV_ITEMS.map(
                            item => (

                                <button
                                    key={item.id}

                                    className={
                                        `interview-nav__item ${
                                            activeNav === item.id
                                                ? "interview-nav__item--active"
                                                : ""
                                        }`
                                    }

                                    onClick={() =>
                                        setActiveNav(
                                            item.id
                                        )
                                    }
                                >

                                    <span className="interview-nav__icon">
                                        {item.icon}
                                    </span>

                                    {item.label}

                                </button>

                            )
                        )}

                    </div>


                    {/* DOWNLOAD RESUME */}

                    <button

                        onClick={() =>
                            getResumePdf(
                                interviewId
                            )
                        }

                        className="button primary-button"
                    >

                        Download Resume

                    </button>

                </nav>


                <div className="interview-divider" />


                {/* ==================================
                    CENTER CONTENT
                ================================== */}

                <main className="interview-content">


                    {/* TECHNICAL */}

                    {activeNav === "technical" && (

                        <section>

                            <div className="content-header">

                                <h2>
                                    Technical Questions
                                </h2>

                                <span className="content-header__count">

                                    {technicalQuestions.length}

                                    {" "}

                                    {technicalQuestions.length === 1
                                        ? "question"
                                        : "questions"}

                                </span>

                            </div>


                            {technicalQuestions.length === 0 ? (

                                <div className="empty-state">

                                    <h3>
                                        No technical questions available
                                    </h3>

                                    <p>
                                        Technical questions were not generated for this report.
                                    </p>

                                </div>

                            ) : (

                                <div className="q-list">

                                    {technicalQuestions.map(
                                        (question, index) => (

                                            <QuestionCard

                                                key={index}

                                                item={question}

                                                index={index}

                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </section>
                    )}


                    {/* BEHAVIORAL */}

                    {activeNav === "behavioral" && (

                        <section>

                            <div className="content-header">

                                <h2>
                                    Behavioral Questions
                                </h2>

                                <span className="content-header__count">

                                    {behavioralQuestions.length}

                                    {" "}

                                    {behavioralQuestions.length === 1
                                        ? "question"
                                        : "questions"}

                                </span>

                            </div>


                            {behavioralQuestions.length === 0 ? (

                                <div className="empty-state">

                                    <h3>
                                        No behavioral questions available
                                    </h3>

                                    <p>
                                        Behavioral questions were not generated for this report.
                                    </p>

                                </div>

                            ) : (

                                <div className="q-list">

                                    {behavioralQuestions.map(
                                        (question, index) => (

                                            <QuestionCard

                                                key={index}

                                                item={question}

                                                index={index}

                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </section>
                    )}


                    {/* ROADMAP */}

                    {activeNav === "roadmap" && (

                        <section>

                            <div className="content-header">

                                <h2>
                                    Preparation Road Map
                                </h2>

                                <span className="content-header__count">

                                    {preparationPlan.length}

                                    -day plan

                                </span>

                            </div>


                            {preparationPlan.length === 0 ? (

                                <div className="empty-state">

                                    <h3>
                                        No preparation plan available
                                    </h3>

                                </div>

                            ) : (

                                <div className="roadmap-list">

                                    {preparationPlan.map(
                                        day => (

                                            <RoadMapDay

                                                key={day.day}

                                                day={day}

                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </section>
                    )}

                </main>


                <div className="interview-divider" />


                {/* ==================================
                    RIGHT SIDEBAR
                ================================== */}

                <aside className="interview-sidebar">


                    {/* MATCH SCORE */}

                    <div className="match-score">

                        <p className="match-score__label">
                            Match Score
                        </p>


                        <div
                            className={
                                `match-score__ring ${scoreColor}`
                            }
                        >

                            <span className="match-score__value">
                                {matchScore}
                            </span>

                            <span className="match-score__pct">
                                %
                            </span>

                        </div>


                        <p className="match-score__sub">
                            {scoreMessage}
                        </p>

                    </div>


                    <div className="sidebar-divider" />


                    {/* SKILL GAPS */}

                    <div className="skill-gaps">

                        <p className="skill-gaps__label">
                            Skill Gaps
                        </p>


                        {skillGaps.length === 0 ? (

                            <p>
                                No major skill gaps identified.
                            </p>

                        ) : (

                            <div className="skill-gaps__list">

                                {skillGaps.map(
                                    (gap, index) => (

                                        <span
                                            key={index}

                                            className={
                                                `skill-tag skill-tag--${gap.severity}`
                                            }
                                        >

                                            {gap.skill}

                                        </span>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </aside>

            </div>

        </div>
    );
};


export default Interview;