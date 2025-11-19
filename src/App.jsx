import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateCameraScore } from './utils/cameraScore';

function App() {
    const [stream, setStream] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    const startCamera = async () => {
        try {
            setError(null);
            setResult(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 }
                }
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Start analysis after a brief delay to let the camera warm up/stabilize
            setAnalyzing(true);
            setTimeout(() => {
                analyzeQuality(mediaStream);
                setAnalyzing(false);
            }, 2000);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure you have a camera connected and have granted permission.");
        }
    };

    const analyzeQuality = (mediaStream) => {
        const track = mediaStream.getVideoTracks()[0];
        const settings = track.getSettings();
        const scoreData = calculateCameraScore(settings);
        setResult(scoreData);
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stream]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl z-10"
            >
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">
                        <span className="primary-gradient-text">CamCheck</span> Pro
                    </h1>
                    <p className="text-gray-400 text-lg">Instant AI-powered camera quality analysis</p>
                </header>

                <div className="glass-panel p-8 mb-8">
                    {!stream && !result && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Camera size={48} className="text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-4">Ready to check your quality?</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                We'll analyze your resolution, frame rate, and aspect ratio to give you a comprehensive quality score.
                            </p>
                            <button onClick={startCamera} className="btn-primary flex items-center gap-2 mx-auto">
                                <Video size={20} />
                                Start Camera Check
                            </button>
                            {error && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center justify-center gap-2">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    {stream && (
                        <div className="space-y-8">
                            <div className="camera-container">
                                <video ref={videoRef} autoPlay playsInline muted />
                                {analyzing && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-xl font-medium">Analyzing stream quality...</p>
                                    </div>
                                )}
                            </div>

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                >
                                    {/* Score Card */}
                                    <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                                        <h3 className="text-gray-400 mb-4 uppercase tracking-wider text-sm">Overall Score</h3>
                                        <div className="score-circle mb-4" style={{
                                            borderColor: result.score >= 7 ? '#10b981' : result.score >= 4 ? '#f59e0b' : '#ef4444',
                                            color: result.score >= 7 ? '#10b981' : result.score >= 4 ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {result.score}
                                        </div>
                                        <div className="text-2xl font-bold mb-1">{result.label}</div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="glass-panel p-6 md:col-span-2">
                                        <h3 className="text-gray-400 mb-6 uppercase tracking-wider text-sm">Technical Metrics</h3>
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                                <div className="text-sm text-gray-400 mb-1">Resolution</div>
                                                <div className="font-mono font-bold text-lg">{result.metrics.resolution}</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                                <div className="text-sm text-gray-400 mb-1">Frame Rate</div>
                                                <div className="font-mono font-bold text-lg">{result.metrics.frameRate}</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                                <div className="text-sm text-gray-400 mb-1">Aspect Ratio</div>
                                                <div className="font-mono font-bold text-lg">{result.metrics.aspectRatio}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {result.details.map((detail, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <CheckCircle size={16} className="text-indigo-400" />
                                                    {detail}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {result && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={startCamera}
                                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <RefreshCw size={18} />
                                        Retest Camera
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default App;
