import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

import {
    login,
    register,
    logout,
    getMe
} from "../services/auth.api";


export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;


    // ==========================================
    // LOGIN
    // ==========================================

    const handleLogin = async ({ email, password }) => {

        setLoading(true);

        try {

            const data = await login({
                email,
                password
            });

            setUser(data.user);

            return data;

        } catch (error) {

            console.error("Login error:", error);

            throw error;

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // REGISTER
    // ==========================================

    const handleRegister = async ({
        username,
        email,
        password
    }) => {

        setLoading(true);

        try {

            const data = await register({
                username,
                email,
                password
            });

            setUser(data.user);

            return data;

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            throw error;

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = async () => {

        setLoading(true);

        try {

            const data = await logout();

            setUser(null);

            return data;

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            throw error;

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // CHECK CURRENT USER
    // ==========================================

    useEffect(() => {

        let cancelled = false;

        const checkUser = async () => {

            console.log(
                "Checking authenticated user..."
            );

            try {

                const data = await Promise.race([

                    getMe(),

                    new Promise((_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error(
                                        "Authentication request timed out"
                                    )
                                ),
                            5000
                        )
                    )

                ]);

                console.log(
                    "getMe response:",
                    data
                );

                if (!cancelled) {

                    setUser(
                        data?.user || null
                    );
                }

            } catch (error) {

                console.log(
                    "User is not authenticated:",
                    error.message
                );

                if (!cancelled) {

                    setUser(null);
                }

            } finally {

                if (!cancelled) {

                    console.log(
                        "Authentication check finished"
                    );

                    setLoading(false);
                }
            }
        };


        checkUser();


        return () => {
            cancelled = true;
        };

    }, []);


    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    };
};


export default useAuth;