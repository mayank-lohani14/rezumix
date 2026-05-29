"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    CheckCircle2,
    ArrowLeft,
    Brain,
    Star,
    Clock,
    Target,
    Sparkles,
    User,
    ArrowRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Button } from "../ui/button";
import { FetchErrorBanner } from "@/components/ui/fetch-error-banner";

/* ---------------- BACKGROUND ---------------- */
const GridBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
    <div className="absolute top-0 left-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
    <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-pink-600/5 blur-[120px] rounded-full mix-blend-screen" />
  </div>
);

export default function PersonalityPrediction() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [personalityResult, setPersonalityResult] = useState("");
    const [fetchError, setFetchError] = useState("");
    const [name, setName] = useState("");
    const [quizStarted, setQuizStarted] = useState(false);

    /* ---------------- COPY FUNCTION ---------------- */
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
        } catch (err) {
            console.log("Copy failed:", err);
        }
    };

    /* ---------------- QUESTIONS ---------------- */
    const questions = [
        { id: 1, text: "Do you prefer structured routines?" },
        { id: 2, text: "Do you enjoy socializing in large groups?" },
        { id: 3, text: "Do you make decisions based on logic?" },
        { id: 4, text: "Do you enjoy working in a team?" },
        { id: 5, text: "Do you enjoy working independently?" },
        { id: 6, text: "Are you comfortable taking risks in decision-making?" },
        { id: 7, text: "Are you highly organized and detail-oriented?" },
        { id: 8, text: "Do you find it easy to empathize with others?" },
        { id: 9, text: "Do you enjoy learning new skills and concepts?" },
        { id: 10, text: "Do you prefer working under pressure?" },
        { id: 11, text: "Are you more of a leader in group settings?" },
        { id: 12, text: "Do you handle unexpected changes well?" },
        { id: 13, text: "Do you rely on data and facts when making decisions?" },
        { id: 14, text: "Do you prefer working on long-term projects?" },
        { id: 15, text: "Are you comfortable speaking in front of large audiences?" },
        { id: 16, text: "Do you often reflect on your thoughts and emotions?" },
        { id: 17, text: "Do you enjoy collaborating with others on complex problems?" },
        { id: 18, text: "Do you prefer a fast-paced work environment?" },
        { id: 19, text: "Are you more motivated by personal growth?" },
        { id: 20, text: "Do you find it easy to adapt to new situations?" },
    ];

    const options = [
        "Strongly Agree",
        "Agree",
        "Neutral",
        "Disagree",
        "Strongly Disagree"
    ];

    /* ---------------- HANDLERS ---------------- */
    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [questions[currentQuestion].text]: value };
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitAnswers(newAnswers);
        }
    };

    const submitAnswers = async (finalAnswers) => {
        setSubmitted(true);
        try {
            const response = await fetch(`/api/personality-prediction`, {
                method: "POST",
                body: JSON.stringify({ answers: finalAnswers, name })
            });

            if (!response.ok) throw new Error(`Request failed`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = JSON.parse(line.slice(6));
                        setPersonalityResult((prev) => prev + data.content);
                    }
                }
            }
        } catch (error) {
            setFetchError(error.message || "Failed to analyze personality.");
        }
    };

    const retakeQuiz = () => {
        setSubmitted(false);
        setCurrentQuestion(0);
        setAnswers({});
        setPersonalityResult("");
        setFetchError("");
        setQuizStarted(false);
        setName("");
    };

    const renderMarkdown = (markdown) => {
        if (!markdown) return { __html: "" };
        marked.setOptions({ breaks: true, gfm: true });
        return { __html: marked(markdown) };
    };

    if (status === "loading") return null;

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200">
            <GridBackground />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 md:py-32">
                <AnimatePresence mode="wait">
                    {!quizStarted ? (
                        <motion.div 
                            key="start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Brain className="w-10 h-10 text-purple-500" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Personality Predictor
                            </h1>
                            <p className="text-slate-400 mb-8 max-w-md">
                                Answer 20 quick questions to uncover insights about your working style, strengths, and personality traits.
                            </p>
                            
                            <div className="w-full max-w-sm space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white"
                                    />
                                </div>
                                <button 
                                    onClick={() => setQuizStarted(true)}
                                    disabled={!name.trim()}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    Start Assessment <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : !submitted ? (
                        <motion.div 
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                        >
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4 text-sm font-medium text-slate-400">
                                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                                    <span>{Math.round(((currentQuestion) / questions.length) * 100)}% Completed</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500 transition-all duration-300 ease-out"
                                        style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl text-white font-medium mb-10 leading-tight">
                                {questions[currentQuestion].text}
                            </h2>

                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option)}
                                        className="w-full text-left px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 rounded-xl text-slate-200 transition-all duration-200 group flex items-center justify-between"
                                    >
                                        <span className="text-lg">{option}</span>
                                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 text-purple-500 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                        >
                            {personalityResult && (
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-purple-500" />
                                        Your Results
                                    </h2>
                                    <button
                                        onClick={() => copyToClipboard(personalityResult)}
                                        className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                                    >
                                        Copy Result
                                    </button>
                                </div>
                            )}

                            {fetchError ? (
                                <FetchErrorBanner message={fetchError} />
                            ) : personalityResult ? (
                                <div
                                    className="text-slate-300 leading-relaxed space-y-6 prose prose-invert max-w-none"
                                    dangerouslySetInnerHTML={renderMarkdown(personalityResult)}
                                />
                            ) : (
                                <div className="flex flex-col items-center py-20 text-slate-400">
                                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="text-lg animate-pulse">Generating your personality profile...</p>
                                </div>
                            )}

                            {personalityResult && (
                                <div className="mt-10 pt-6 border-t border-white/10">
                                    <button 
                                        onClick={retakeQuiz}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" /> Retake Assessment
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
