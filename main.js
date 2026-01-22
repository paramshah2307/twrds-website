import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://sxjuhznyaejkbxjanbiq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anVoem55YWVqa2J4amFuYmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjYwNzQsImV4cCI6MjA4NDYwMjA3NH0.0gX_H4EIiCIBO9w0Q16zSH_UKRFN5Ld6LzETxHhV4mw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// twrds-website: main.js
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtext = document.querySelector('.hero-subtext');
    const section2 = document.getElementById('trigger-section-2');
    const scroller = document.querySelector('.scrolling-text-container');
    const launchEmailInput = document.getElementById('launch-email');
    const launchCta = document.getElementById('launch-cta');
    const section3 = document.getElementById('section-3');
    const navbarLogo = document.querySelector('.navbar .logo');
    const navbarCta = document.querySelector('.navbar .nav-cta');

    // --- 1. Hero Text & Shared Scroll State ---
    let ticking = false;

    const updateHeroAnimation = (scrollY, vh) => {
        if (!heroTitle || !heroSubtext) return;
        const startFade = vh * 0.25;
        const endFade = vh * 0.75;

        let textProgress = 0;
        if (scrollY > startFade) {
            textProgress = Math.min((scrollY - startFade) / (endFade - startFade), 1);
        }

        const opacity = 1 - textProgress;
        const blur = textProgress * 10;

        heroTitle.style.opacity = opacity;
        heroTitle.style.filter = `blur(${blur}px)`;
        heroSubtext.style.opacity = opacity;
        heroSubtext.style.filter = `blur(${blur}px)`;
    };

    // --- 2. Section 2 Initialization & Effects ---
    let wordData = [];

    const initSection2 = () => {
        if (!section2 || !scroller) return;

        // Wrap words once
        const scrollTexts = scroller.querySelectorAll('.scroll-text');
        scrollTexts.forEach(p => {
            if (p.querySelector('.word')) return;

            const wrapNode = (node, isAccent = false) => {
                if (node.nodeType === 3) { // Text node
                    const text = node.textContent;
                    const words = text.split(/(\s+)/);
                    const fragment = document.createDocumentFragment();

                    words.forEach(word => {
                        if (word.trim() === '') {
                            fragment.appendChild(document.createTextNode(word));
                        } else {
                            const span = document.createElement('span');
                            span.className = isAccent ? 'word accent' : 'word';
                            span.textContent = word;
                            fragment.appendChild(span);
                        }
                    });
                    return fragment;
                } else if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'BR') return null;

                    const accent = isAccent || node.classList.contains('accent-phrase');
                    const children = Array.from(node.childNodes);
                    children.forEach(child => {
                        const wrapped = wrapNode(child, accent);
                        if (wrapped) node.replaceChild(wrapped, child);
                    });
                    return null;
                }
                return null;
            };

            // Process child nodes
            Array.from(p.childNodes).forEach(child => {
                const wrapped = wrapNode(child);
                if (wrapped) p.replaceChild(wrapped, child);
            });
        });

        // Cache positions relative to the scroll container
        cacheWordOffsets();
    };

    const cacheWordOffsets = () => {
        const words = scroller.querySelectorAll('.word');
        wordData = Array.from(words).map(el => ({
            el: el,
            offsetTop: el.offsetTop
        }));
    };

    const updateSection2Effects = (vh, isMobile) => {
        if (!section2 || !scroller) return;
        const rect = section2.getBoundingClientRect();

        // A. Mask Handling (Vanishing Point Fade)
        const vanishPoint = isMobile ? vh * 0.16 : vh * 0.14;
        const featherZone = vh * 0.25;
        const offset = vanishPoint - rect.top;

        let mask;
        if (isMobile) {
            // Symmetric 4-point mask for mobile
            // Top: fade starts at vanishPoint, ends at vanishPoint + featherZone
            // Bottom: fade starts at vh - vanishPoint, ends at vh - vanishPoint - featherZone
            const topStart = offset;
            const topEnd = offset + featherZone;
            const bottomEnd = offset + (vh - vanishPoint);
            const bottomStart = bottomEnd - featherZone;

            mask = `linear-gradient(to bottom, 
                rgba(0,0,0,0) ${topStart}px, 
                rgba(0,0,0,1) ${topEnd}px,
                rgba(0,0,0,1) ${bottomStart}px,
                rgba(0,0,0,0) ${bottomEnd}px)`;
        } else {
            // Standard top-only mask for desktop
            mask = `linear-gradient(to bottom, 
                rgba(0,0,0,0) ${offset}px, 
                rgba(0,0,0,1) ${offset + featherZone}px)`;
        }

        scroller.style.webkitMaskImage = mask;
        scroller.style.maskImage = mask;

        // B. Word Highlighting (Sequential Word-by-Word)
        // Starts when section reaches midpoint (0.5 vh)
        const readingLine = vh * 0.6;
        const totalWords = wordData.length;

        // Calculate scroll progress specifically for highlighting
        // Start highlighting only when 80% of the screen is covered by Section 2 (vh * 0.20)
        const startTrigger = vh * 0.20;
        // Divisor tuned to be faster (0.85) so words highlight before hit the top fade
        const progress = Math.max(0, Math.min(1, (startTrigger - rect.top) / (rect.height * 0.85)));

        const highlightCount = progress * totalWords;

        wordData.forEach((data, index) => {
            if (index < highlightCount) {
                data.el.classList.add('active');
            } else {
                data.el.classList.remove('active');
            }
        });
    };

    const updateNavFade = (vh) => {
        if (!section3 || !navbarLogo || !navbarCta) return;
        const rect = section3.getBoundingClientRect();

        // Navigation should be fully visible when Section 3 is at the bottom (rect.top == vh)
        // and fully invisible when Section 3 is at 20% from the top (rect.top == vh * 0.2)
        // This means it's 80% covered.
        const fadeStart = vh;
        const fadeEnd = vh * 0.2;

        const opacity = Math.max(0, Math.min(1, (rect.top - fadeEnd) / (fadeStart - fadeEnd)));

        navbarLogo.style.opacity = opacity;
        navbarCta.style.opacity = opacity;

        // Disable pointer events when invisible to prevent accidental clicks
        const pointerEvents = opacity === 0 ? 'none' : 'auto';
        navbarLogo.style.pointerEvents = pointerEvents;
        navbarCta.style.pointerEvents = pointerEvents;
    };

    // --- 3. Centralized Scroll Listener ---
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const vh = window.innerHeight;
                const isMobile = window.innerWidth <= 768;

                updateHeroAnimation(scrollY, vh);
                updateSection2Effects(vh, isMobile);
                updateNavFade(vh);

                ticking = false;
            });
            ticking = true;
        }
    };

    // --- 4. Launch Email Logic ---
    const initLaunchLogic = () => {
        if (!launchEmailInput || !launchCta) return;
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        launchCta.addEventListener('click', async () => {
            if (isValidEmail(launchEmailInput.value)) {
                const email = launchEmailInput.value.trim();
                await supabase
                    .from('twrds waitlist')
                    .insert([{ email, source: 'landing' }])
                const { error } = await supabase.from('launch_emails').insert({ email });
                if (error) {
                    console.error('Error inserting email:', error);
                }
                launchCta.classList.add('flipped');
                launchEmailInput.value = '';
                launchEmailInput.blur();
                launchEmailInput.classList.remove('has-text');
                setTimeout(() => launchCta.classList.remove('flipped'), 5000);
            } else {
                launchEmailInput.style.borderBottomColor = '#ff665a';
                launchEmailInput.classList.add('shake-animation');
                setTimeout(() => {
                    launchEmailInput.style.borderBottomColor = '';
                    launchEmailInput.classList.remove('shake-animation');
                }, 1000);
            }
        });

        launchEmailInput.addEventListener('input', () => {
            launchEmailInput.style.borderBottomColor = '';
            if (launchEmailInput.value.trim().length > 0) {
                launchEmailInput.classList.add('has-text');
            } else {
                launchEmailInput.classList.remove('has-text');
            }
        });
    };

    // --- Execution ---
    initSection2();
    initLaunchLogic();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        if (scroller) cacheWordOffsets();
        onScroll();
    });

    // Run initial state
    onScroll();
});
