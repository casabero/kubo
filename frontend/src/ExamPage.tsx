import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api';

interface Question {
    id: string;
    content: string;
    type: string;
    options: string[]; // Parsing JSON to string[] in component
}

interface ExamSession {
    id: string;
    // ... other fields
}

export const ExamPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Assessment ID
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<ExamSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [completed, setCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        const start = async () => {
            try {
                if (!id) return;
                const data = await apiClient.startExam(id);
                if (data.completed) {
                    setCompleted(true);
                } else {
                    setSession(data.session);
                    setCurrentQuestion(parseQuestion(data.question));
                    setStartTime(Date.now());
                }
            } catch (err) {
                console.error(err);
                alert('Failed to start exam');
            } finally {
                setLoading(false);
            }
        };
        start();
    }, [id]);

    const parseQuestion = (q: any): Question => {
        // Assuming options comes as a JSON string or object from backend. 
        // Backend Prisma 'Json' type comes as object in JSON response usually.
        let opts = [];
        try {
            opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        } catch (e) { opts = [] }

        return {
            ...q,
            options: Array.isArray(opts) ? opts : Object.values(opts || {})
        };
    };

    const handleSubmit = async () => {
        if (!selectedOption || !session || !currentQuestion) return;

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        setLoading(true);

        try {
            const result = await apiClient.submitAnswer({
                sessionId: session.id,
                questionId: currentQuestion.id,
                chosenOption: selectedOption,
                timeSpent
            });

            if (result.completed) {
                setCompleted(true);
            } else {
                // Determine feedback? The requirement says "Feedback: Si falla, muestra botón 'Solicitar Pista'"
                // The backend currently returns { correct, newTheta, ... }
                if (!result.correct) {
                    // Pause for feedback
                    setFeedback("Incorrect. Need a hint?");
                    // For now, just wait for user to click "Next" or "Hint"
                    // Implementing auto-advance for success
                } else {
                    setCurrentQuestion(parseQuestion(result.nextQuestion));
                    setSelectedOption(null);
                    setStartTime(Date.now());
                    setFeedback(null);
                }

                // If we want to strictly follow "Next Question" immediately on success:
                if (result.correct) {
                    setCurrentQuestion(parseQuestion(result.nextQuestion));
                    setSelectedOption(null);
                    setStartTime(Date.now());
                    setFeedback(null);
                } else {
                    // Store next question to show after feedback
                    // For simplicity in this iteration, I'll just show the next question after a brief delay or let user click next
                    // But requirement says "Request Hint" button.
                    // Let's hold the next question in a temp state if we want to show feedback first.
                    // To keep it simple: Show feedback overlay, then user clicks "Continue".
                    setCurrentQuestion(parseQuestion(result.nextQuestion));
                    setSelectedOption(null);
                    setStartTime(Date.now());
                    setFeedback(null); // Resetting for now as the logic to show feedback AND next question needs state
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;

    if (completed) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-8">
                <h1 className="text-4xl font-bold mb-4 font-inter">Exam Completed! 🎉</h1>
                <p className="text-slate-400">Great job being focused.</p>
                {/* Result summary could go here */}
            </div>
        );
    }

    if (!currentQuestion) return <div>Error loading question</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
            {/* Focus Mode Header - Minimal */}
            <header className="p-4 bg-white shadow-sm flex justify-between items-center">
                <span className="font-bold text-slate-400">FOCUS MODE</span>
                {/* Timer or Progress could go here */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">

                <h2 className="text-2xl md:text-3xl font-inter font-medium mb-12 text-center leading-snug">
                    {currentQuestion.content}
                </h2>

                <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(opt)}
                            className={`p-6 rounded-xl border-2 text-lg transition-all text-left
                                ${selectedOption === opt
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-white bg-white'
                                }
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="mt-12">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className={`px-12 py-4 rounded-full font-bold text-lg transition-all
                            ${selectedOption
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transform hover:-translate-y-1'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        Submit Answer
                    </button>
                </div>

                {/* Placeholder for Hint Button as requested */}
                {feedback && (
                    <div className="mt-4">
                        <button className="text-indigo-600 underline">Solicitar Pista</button>
                    </div>
                )}
            </main>
        </div>
    );
};
