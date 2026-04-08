import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

interface CalmWelcomeProps {
    onComplete?: () => void;
}

const slides = [
    {
        id: 1,
        image: "/firstImage.png",
        emoji: "🌿",
        text: "Hey there. Dr. Hana is here — no rush, just you and me.",
        accent: "#22d3ee"
    },
    {
        id: 2,
        image: "/second.png",
        emoji: "🫶",
        text: "You don't have to be strong right now. Drop the armor. Just breathe.",
        accent: "#34d399"
    },
    {
        id: 3,
        image: "/THIRD.png",
        emoji: "🤫",
        text: "Zero judgment. No filters. Whatever's on your mind — let it out.",
        accent: "#a78bfa"
    },
    {
        id: 4,
        image: "/fourth.png",
        emoji: "🗝️",
        text: "Keep your Secret Key safe — it's how we pick up where we left off.",
        accent: "#f9a8d4"
    }
];

// How long each slide stays visible (ms) — keep this short so it never feels slow
const SLIDE_HOLD_MS = 2500;
const ANIM_IN_MS = 0.5;   // seconds (gsap)
const ANIM_OUT_MS = 0.35; // seconds (gsap)

const CalmWelcome: React.FC<CalmWelcomeProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [done, setDone] = useState(false);
    const [progress, setProgress] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const progressAnimRef = useRef<gsap.core.Tween | null>(null);
    const slideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goToNext = useCallback(() => {
        setCurrentSlide(prev => {
            const next = prev + 1;
            if (next >= slides.length) {
                setDone(true);
                return prev;
            }
            return next;
        });
    }, []);

    const handleSkip = useCallback(() => {
        // Kill any running animations/timers
        if (progressAnimRef.current) progressAnimRef.current.kill();
        if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
        gsap.killTweensOf([imageRef.current, textRef.current]);
        setDone(true);
    }, []);

    const handleComplete = useCallback(() => {
        if (onComplete) onComplete();
    }, [onComplete]);

    // Floating animation — re-runs per slide
    useEffect(() => {
        if (done || !imageRef.current) return;
        const ctx = gsap.context(() => {
            gsap.to(imageRef.current, {
                y: -14,
                duration: 2.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        return () => ctx.revert();
    }, [currentSlide, done]);

    // Slide transition — in → hold → out
    useEffect(() => {
        if (done) return;
        if (currentSlide >= slides.length) { setDone(true); return; }

        // Reset progress
        if (progressAnimRef.current) progressAnimRef.current.kill();
        setProgress((currentSlide / slides.length) * 100);

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Fade IN
            tl.fromTo(
                [imageRef.current, textRef.current],
                { opacity: 0, y: 28, scale: 0.94 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: ANIM_IN_MS,
                    stagger: 0.18,
                    ease: "back.out(1.1)"
                }
            );

            // Animate progress bar during hold
            tl.call(() => {
                const startPct = (currentSlide / slides.length) * 100;
                const endPct = ((currentSlide + 1) / slides.length) * 100;
                progressAnimRef.current = gsap.fromTo(
                    {},
                    { val: startPct },
                    {
                        val: endPct,
                        duration: SLIDE_HOLD_MS / 1000,
                        ease: "none",
                        onUpdate: function () {
                            setProgress(this.targets()[0].val);
                        }
                    }
                );
            });

            // Hold, then fade OUT
            tl.to(
                [imageRef.current, textRef.current],
                {
                    opacity: 0,
                    y: -18,
                    scale: 1.04,
                    duration: ANIM_OUT_MS,
                    stagger: 0.07,
                    ease: "power2.in",
                    delay: SLIDE_HOLD_MS / 1000,
                    onComplete: goToNext
                }
            );
        });

        return () => ctx.revert();
    }, [currentSlide, done, goToNext]);

    // Done: fade in completion screen
    useEffect(() => {
        if (!done) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.5, ease: "power2.out" }
            );
        });
        return () => ctx.revert();
    }, [done]);

    if (done) {
        return (
            <div
                ref={containerRef}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]/97 backdrop-blur-3xl text-white px-6"
                style={{ opacity: 0 }}
            >
                {/* Aura */}
                <div className="absolute w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }}
                />

                <div className="flex flex-col items-center gap-5 text-center z-10">
                    <div style={{ fontSize: 72, lineHeight: 1 }}>✨</div>
                    <p className="text-emerald-50 text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                        You're all set.
                    </p>
                    <p className="text-white/50 text-base md:text-lg max-w-xs leading-relaxed">
                        Dr. Hana is ready whenever you are.
                    </p>
                    <button
                        onClick={handleComplete}
                        className="mt-2 px-8 py-3 rounded-full text-[#030712] font-semibold text-base transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #22d3ee, #34d399)' }}
                    >
                        Let's begin →
                    </button>
                </div>
            </div>
        );
    }

    const slide = slides[currentSlide];

    return (
        <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]/95 backdrop-blur-3xl text-white overflow-hidden px-6 py-10"
        >
            {/* === Progress bar (full width, top) === */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
                <div
                    className="h-full rounded-r-full transition-none"
                    style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, #22d3ee, ${slide.accent})`
                    }}
                />
            </div>

            {/* === Dot indicators === */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-[6px]">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className="w-[6px] h-[6px] rounded-full transition-all duration-300"
                        style={{
                            background: i === currentSlide ? slide.accent : 'rgba(255,255,255,0.18)',
                            transform: i === currentSlide ? 'scale(1.3)' : 'scale(1)'
                        }}
                    />
                ))}
            </div>

            {/* === Skip button === */}
            <button
                onClick={handleSkip}
                className="absolute top-3 right-4 text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded"
                style={{ fontFamily: 'inherit' }}
            >
                Skip →
            </button>

            {/* === Slide content === */}
            <div className="flex flex-col items-center justify-center text-center max-w-2xl w-full h-full z-10 gap-8 md:gap-12">

                {/* Glow aura */}
                <div
                    className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full pointer-events-none transition-all duration-700"
                    style={{ background: `radial-gradient(circle, ${slide.accent}22 0%, transparent 70%)` }}
                />

                {/* Image container */}
                <div className="relative w-full h-[44vh] md:h-[50vh] flex items-center justify-center">
                    <img
                        ref={imageRef}
                        src={slide.image}
                        alt="MindPulse Welcome"
                        className="relative z-10 w-auto h-full object-contain"
                        style={{
                            filter: `drop-shadow(0 0 40px ${slide.accent}80)`,
                            maxWidth: '100%'
                        }}
                    />
                </div>

                {/* Text */}
                <p
                    ref={textRef}
                    className="text-emerald-50 text-xl md:text-3xl lg:text-4xl font-semibold leading-relaxed max-w-xl mx-auto"
                    style={{
                        fontFamily: 'Georgia, serif',
                        textShadow: `0 0 30px ${slide.accent}55`
                    }}
                >
                    "{slide.text}"
                </p>

            </div>
        </div>
    );
};

export default CalmWelcome;