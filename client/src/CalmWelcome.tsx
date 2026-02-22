import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CalmWelcomeProps {
    onComplete?: () => void;
}

const slides = [
    {
        id: 1,
        image: "/firstImage.png",
        text: "Welcome! Dr. Hana is here to listen..."
    },
    {
        id: 2,
        image: "/second.png",
        text: "You're not a supercomputer, just a sweet human! Drop your heavy armor and relax."
    },
    {
        id: 3,
        image: "/THIRD.png",
        text: "Deep breath. Mute the world. No filters, zero judgment just you and me."
    },
    {
        id: 4,
        image: "/fourth.png",
        text: "Keep your Secret Key safe! It's our little magic key to meet again."
    }
];

const CalmWelcome: React.FC<CalmWelcomeProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);

    // Continuous floating animation for the massive image
    useEffect(() => {
        if (!imageRef.current) return;
        const floatCtx = gsap.context(() => {
            gsap.to(imageRef.current, {
                y: -20,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        return () => floatCtx.revert();
    }, [currentSlide]);

    // Handle GSAP Stagger Transitions
    useEffect(() => {
        if (currentSlide >= slides.length) {
            if (onComplete) onComplete();
            return;
        }

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            
            // 1. Stagger IN: Image comes first, then the text follows smoothly
            tl.fromTo([imageRef.current, textRef.current], 
                { opacity: 0, scale: 0.9, y: 50 },
                { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.4, ease: "back.out(1.2)" }
            );

            // 2. Wait 4.5 seconds for the user to read the quote
            tl.to([imageRef.current, textRef.current], {
                opacity: 0, 
                scale: 1.05, 
                y: -30, 
                duration: 0.8, 
                stagger: 0.1,
                ease: "power2.in",
                delay: 4.5, 
                onComplete: () => {
                    setCurrentSlide(prev => prev + 1);
                }
            });
        });

        return () => ctx.revert();
    }, [currentSlide, onComplete]);

    
    if (currentSlide >= slides.length) return null;

    const activeSlideData = slides[currentSlide];

    return (
        <div ref={containerRef} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]/95 backdrop-blur-3xl text-white overflow-hidden px-6 py-10">
            
            <div className="flex flex-col items-center justify-center text-center max-w-5xl w-full h-full z-10">
                
                {/* Huge Glowing Character Image - Scales to screen height so it NEVER pushes text off */}
                <div className="relative w-full h-[50vh] md:h-[55vh] lg:h-[60vh] flex items-center justify-center mb-8 md:mb-12">
                    {/* Pulsing blue aura behind the character */}
                    <div className="absolute inset-0 bg-cyan-400/20 blur-[80px] rounded-full animate-pulse w-[300px] h-[300px] md:w-[450px] md:h-[450px] m-auto" />
                    
                    <img 
                        ref={imageRef}
                        src={activeSlideData.image} 
                        alt="MindPulse Welcome" 
                        // Using 'h-full w-auto' makes it huge but completely bound to the 60vh container height
                        className="relative z-10 w-auto h-full object-contain drop-shadow-[0_0_60px_rgba(34,211,238,0.8)]"
                    />
                </div>

                {/* Massive Text Quote - Added glowing drop-shadow effect directly to text */}
                <p 
                    ref={textRef}
                    className="text-emerald-50 text-2xl md:text-4xl lg:text-5xl italic font-semibold leading-relaxed max-w-4xl mx-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                >
                    "{activeSlideData.text}"
                </p>

            </div>
        </div>
    );
};

export default CalmWelcome;