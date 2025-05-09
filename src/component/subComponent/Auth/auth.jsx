"use client"
import { useState } from "react";
import { useRouter } from "next/navigation"; // Updated import for App Router
import Cookies from "js-cookie";

const Auth = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const endpoint = isLogin ? "login" : "register";
            const body = isLogin 
                ? { email: formData.email, password: formData.password }
                : formData;

            const res = await fetch(`/api/auth/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Authentication failed");
            }

            if (isLogin) {
                Cookies.set("token", data.token, { 
                    expires: 1,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict"
                });
                router.push("/Dashboard");
            } else {
                alert("Registration successful! Please log in.");
                setIsLogin(true);
                setFormData(prev => ({ ...prev, name: "" }));
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-4">
                    {isLogin ? "Login" : "Register"}
                </h2>

                {error && (
                    <p className="text-red-500 text-center mb-4 p-2 bg-red-50 rounded">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 px-4 rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {isLoading ? (
                            <span className="flex justify-center items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : isLogin ? "Login" : "Register"}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="text-blue-500 hover:text-blue-600 ml-1 font-medium"
                        disabled={isLoading}
                    >
                        {isLogin ? "Register here" : "Login here"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;