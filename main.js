// CTA and Hero Text Scroll Animation
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtext = document.querySelector('.hero-subtext');

    // Ensure critical elements exist before running logic
    if (!heroTitle || !heroSubtext) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;

        // Hero Text Animation
        if (heroTitle && heroSubtext) {
            const startFade = viewportHeight * 0.25; // start at 25%
            const endFade = viewportHeight * 0.75;   // end at 75%

            let textProgress = 0;
            if (scrollY > startFade) {
                textProgress = Math.min((scrollY - startFade) / (endFade - startFade), 1);
            }

            // Opacity 1 -> 0, Blur 0 -> 10px
            const opacity = 1 - textProgress;
            const blur = textProgress * 10;

            heroTitle.style.opacity = opacity;
            heroTitle.style.filter = `blur(${blur}px)`;

            heroSubtext.style.opacity = opacity;
            heroSubtext.style.filter = `blur(${blur}px)`;
        }

        // Scrollytelling Text Animation
        const scrollBlocks = document.querySelectorAll('.text-block');
        scrollBlocks.forEach(block => {
            const rect = block.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const viewportHeight = window.innerHeight;

            // Define zones
            const focusStart = viewportHeight * 0.40;
            const focusEnd = viewportHeight * 0.50;
            let visibleStart = viewportHeight * 0.15;
            const visibleEnd = viewportHeight * 0.80;

            // Apply custom fade logic for specific blocks
            if (block.classList.contains('early-fade')) {
                visibleStart = viewportHeight * 0.35; // Fade out earlier when scrolling up
            }

            // Calculate opacity and scale
            let opacity = 0;
            let scale = 0.8;

            if (elementCenter >= focusStart && elementCenter <= focusEnd) {
                // In focus zone
                opacity = 1;
                scale = 1;
            } else if (elementCenter > visibleStart && elementCenter < focusStart) {
                // Upper fade zone (variable start to 40%)
                const progress = (elementCenter - visibleStart) / (focusStart - visibleStart);
                opacity = progress;
                scale = 0.8 + (progress * 0.2); // Scale from 0.8 to 1
            } else if (elementCenter > focusEnd && elementCenter < visibleEnd) {
                // Lower fade zone (55% to 85%)
                const progress = (visibleEnd - elementCenter) / (visibleEnd - focusEnd);
                opacity = progress;
                scale = 0.8 + (progress * 0.2); // Scale from 0.8 to 1
            }

            block.style.opacity = opacity;
            block.style.transform = `scale(${scale})`;
            block.style.filter = 'none';
        });

    });

    // Email Validation Logic
    const launchEmailInput = document.getElementById('launch-email');
    const launchCta = document.getElementById('launch-cta');

    if (launchEmailInput && launchCta) {
        // Validation check helper
        const isValidEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };

        launchCta.addEventListener('click', () => {
            const email = launchEmailInput.value;
            if (isValidEmail(email)) {
                // Success action: 3D Flip Animation
                launchCta.classList.add('flipped');

                // Clear input
                launchEmailInput.value = '';
                launchEmailInput.blur();
                launchEmailInput.classList.remove('has-text'); // Remove accent border logic

                // Revert after 5 seconds
                setTimeout(() => {
                    launchCta.classList.remove('flipped');
                }, 5000);

            } else {
                // Error feedback
                launchEmailInput.style.borderBottomColor = '#ff665a';
                launchEmailInput.classList.add('shake-animation');
                setTimeout(() => {
                    launchEmailInput.style.borderBottomColor = ''; // Revert to CSS control
                    launchEmailInput.classList.remove('shake-animation');
                }, 1000);
            }
        });

        // Toggle has-text class on input
        launchEmailInput.addEventListener('input', () => {
            // Ensure any error style is cleared
            launchEmailInput.style.borderBottomColor = '';

            if (launchEmailInput.value.trim().length > 0) {
                launchEmailInput.classList.add('has-text');
            } else {
                launchEmailInput.classList.remove('has-text');
            }
        });
    }

    // Initial trigger in case of page reload at position
    window.dispatchEvent(new Event('scroll'));
});
