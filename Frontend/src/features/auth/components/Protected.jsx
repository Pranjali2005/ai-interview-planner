import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "./protected.scss";


const Protected = ({ children }) => {

    const {
        loading,
        user
    } = useAuth();


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {

        return (
            <main className="auth-loading-page">

                <div className="auth-loading-container">

                    {/* Animated Logo */}

                    <div className="ai-loader">

                        <div className="ai-loader-ring"></div>

                        <div className="ai-loader-ring ring-two"></div>

                        <div className="ai-logo">
                            AI
                        </div>

                    </div>


                    {/* Heading */}

                    <h1>
                        Preparing Your Interview
                    </h1>


                    {/* Description */}

                    <p className="loading-description">
                        We're checking your account and
                        preparing your personalized interview
                        experience.
                    </p>


                    {/* Progress Animation */}

                    <div className="loading-progress">

                        <div className="loading-progress-bar"></div>

                    </div>


                    {/* Loading dots */}

                    <div className="loading-dots">

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>


                    {/* Status */}

                    <div className="loading-status">

                        <div className="status-check">
                            ✓
                        </div>

                        <div className="status-content">

                            <strong>
                                Setting things up
                            </strong>

                            <span>
                                This will only take a moment...
                            </span>

                        </div>

                    </div>

                </div>

            </main>
        );
    }


    // ==========================================
    // NOT AUTHENTICATED
    // ==========================================

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // ==========================================
    // AUTHENTICATED
    // ==========================================

    return children;
};


export default Protected;