import React, { useEffect, useState } from "react"
import "./LoadingScreen.scss"

const STEPS = [
    "Parsing resume",
    "Analyzing job description",
    "Matching your profile",
    "Drafting technical questions",
    "Drafting behavioral questions",
    "Building your prep roadmap"
]

const LoadingScreen = ({ label = "Loading your interview plan" }) => {

    const [ activeStep, setActiveStep ] = useState(0)

    useEffect(() => {
        if (activeStep >= STEPS.length - 1) return
        const timer = setTimeout(() => {
            setActiveStep(prev => prev + 1)
        }, 900)
        return () => clearTimeout(timer)
    }, [ activeStep ])

    return (
        <main className="loading-screen">
            <div className="loading-screen__card">

                <div className="loading-screen__badge">
                    <span className="loading-screen__pulse" />
                    AI Engine
                </div>

                <h1 className="loading-screen__title">
                    {label}
                    <span className="loading-screen__cursor">_</span>
                </h1>

                <div className="loading-screen__log">
                    {STEPS.map((step, index) => {
                        const done = index < activeStep
                        const active = index === activeStep

                        return (
                            <div
                                key={step}
                                className={
                                    `loading-screen__row ${done ? "is-done" : ""} ${active ? "is-active" : ""}`
                                }
                            >
                                <span className="loading-screen__marker">
                                    {done ? "✓" : active ? "›" : "·"}
                                </span>
                                <span className="loading-screen__text">
                                    {step}
                                </span>
                                {active && <span className="loading-screen__spinner" />}
                            </div>
                        )
                    })}
                </div>

                <div className="loading-screen__track">
                    <div
                        className="loading-screen__fill"
                        style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

            </div>
        </main>
    )
}

export default LoadingScreen