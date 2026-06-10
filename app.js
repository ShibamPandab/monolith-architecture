/* ==========================================================================
   ATELIER MONOLITH — INTERACTION & ANIMATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initial State & Configs
    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        menuOpen: false,
        scrollPos: 0,
        lastScrollPos: 0,
    };

    // DOM Elements
    const body = document.body;
    const html = document.documentElement;
    const preloader = document.querySelector('.preloader');
    const preloaderProgress = document.querySelector('.preloader-progress');
    const preloaderCounter = document.querySelector('.preloader-counter');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleText = themeToggleBtn.querySelector('.theme-toggle-text');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const menuDrawer = document.querySelector('.menu-drawer');
    const customCursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.custom-cursor-follower');
    const header = document.querySelector('.header');
    const revealImgWrappers = document.querySelectorAll('.reveal-img-wrapper');
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const statNumbers = document.querySelectorAll('.stat-number');
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    /* 1. INITIALIZE STATE
       ========================================================================== */
     const init = () => {
        // Set Theme
        html.setAttribute('data-theme', state.theme);
        updateThemeButtonUI();
        
        // Setup Event Listeners
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Setup Form
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }

        // Setup Buttons & Toggles
        themeToggleBtn.addEventListener('click', toggleTheme);
        menuToggleBtn.addEventListener('click', toggleMenu);

        // Bind custom cursor events
        initCustomCursorHovers();

        // Close menu drawer on link clicks
        document.querySelectorAll('.menu-drawer-link').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Initialize Blueprint Before/After Slider
        initBlueprintSlider();

        // Initialize preloader sequence
        runPreloader();
    };

    /* 2. PRELOADER & COUNTER SEQUENCE
       ========================================================================== */
    const runPreloader = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 4;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                
                // End Preloader
                setTimeout(() => {
                    preloader.style.transform = 'translateY(-100%)';
                    
                    // Trigger intro animations
                    setTimeout(() => {
                        triggerHeroAnimations();
                        initScrollTriggers();
                    }, 600);
                }, 400);
            }
            
            // Update UI
            preloaderProgress.style.width = `${currentProgress}%`;
            preloaderCounter.textContent = currentProgress.toString().padStart(2, '0');
        }, 60);
    };

    /* 3. HERO & INITIAL ANIMATIONS
       ========================================================================== */
    const triggerHeroAnimations = () => {
        // Animate Hero title lines (slide-up)
        const innerTitles = document.querySelectorAll('.hero-title-line .inner');
        innerTitles.forEach((inner, idx) => {
            inner.style.transition = 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
            inner.style.transform = 'translateY(100%)';
            // Force redraw
            inner.offsetHeight;
            setTimeout(() => {
                inner.style.transform = 'translateY(0%)';
            }, idx * 150);
        });

        // Zoom out background image slightly for premium spatial reveal
        const heroBg = document.querySelector('.hero-bg-img');
        if (heroBg) {
            heroBg.style.transition = 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => {
                heroBg.style.transform = 'scale(1)';
            }, 100);
        }

        // Reveal navigation and tagline
        const taglines = document.querySelectorAll('.hero-tagline, .meta-item, .scroll-down-btn');
        taglines.forEach((tag, idx) => {
            tag.style.transition = 'opacity 1.5s ease-out, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            tag.style.transform = 'translateY(20px)';
            tag.style.opacity = '0';
            setTimeout(() => {
                tag.style.transform = 'translateY(0)';
                tag.style.opacity = '1';
            }, 600 + (idx * 150));
        });
    };

    /* 4. CUSTOM CURSOR BEHAVIOR
       ========================================================================== */
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Custom cursor position (immediate)
        customCursor.style.left = `${mouseX}px`;
        customCursor.style.top = `${mouseY}px`;
        
        // Elastic follower position (uses requestAnimationFrame via GSAP if loaded, otherwise CSS transition is fine)
        if (!window.gsap) {
            cursorFollower.style.left = `${mouseX}px`;
            cursorFollower.style.top = `${mouseY}px`;
        }
    }

    // Follower smooth lagging loop
    const updateFollower = () => {
        if (window.gsap) {
            gsap.to(cursorFollower, {
                x: mouseX,
                y: mouseY,
                duration: 0.3,
                ease: 'power3.out',
                overwrite: 'auto'
            });
            // Align offsets since we use translates inside GSAP
            gsap.set(cursorFollower, { left: 0, top: 0 });
        } else {
            // Basic fallback loop
            const dx = mouseX - followerX;
            const dy = mouseY - followerY;
            followerX += dx * 0.15;
            followerY += dy * 0.15;
            cursorFollower.style.transform = `translate(calc(${followerX}px - 50%), calc(${followerY}px - 50%))`;
        }
        requestAnimationFrame(updateFollower);
    };
    
    // Start cursor animation loop
    requestAnimationFrame(updateFollower);

    // Dynamic Hover classes on body
    const initCustomCursorHovers = () => {
        const interactiveElements = document.querySelectorAll('[data-cursor], a, button, input, textarea, select, .magnetic');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const cursorState = el.getAttribute('data-cursor');
                body.className = body.className.replace(/\bcursor-\S+/g, '');
                
                if (cursorState === 'expand') {
                    body.classList.add('cursor-expand');
                } else if (cursorState === 'view') {
                    body.classList.add('cursor-view');
                } else {
                    body.classList.add('cursor-hover');
                }
            });

            el.addEventListener('mouseleave', () => {
                body.classList.remove('cursor-hover', 'cursor-expand', 'cursor-view');
            });
        });
    };

    // Magnetic effect for ultra-premium feel on specific elements
    const initMagnetics = () => {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const bound = el.getBoundingClientRect();
                const x = e.clientX - bound.left - (bound.width / 2);
                const y = e.clientY - bound.top - (bound.height / 2);
                
                if (window.gsap) {
                    gsap.to(el, {
                        x: x * 0.35,
                        y: y * 0.35,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });

            el.addEventListener('mouseleave', () => {
                if (window.gsap) {
                    gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'elastic.out(1, 0.3)'
                    });
                }
            });
        });
    };
    
    initMagnetics();


    /* 5. SCROLL INTERACTIONS, REVEALS, & GSAP HORIZONTAL SCROLL
       ========================================================================== */
    const handleScroll = () => {
        state.scrollPos = window.scrollY;

        // Hide/Show Header
        if (state.scrollPos > 150) {
            if (state.scrollPos > state.lastScrollPos) {
                header.classList.add('hide');
            } else {
                header.classList.remove('hide');
            }
        } else {
            header.classList.remove('hide');
        }

        // Hero Background Parallax Scroll
        const heroBg = document.querySelector('.hero-bg-img');
        if (heroBg && state.scrollPos < window.innerHeight) {
            const movement = state.scrollPos * 0.15;
            heroBg.style.transform = `scale(1.02) translateY(${movement}px)`;
        }

        state.lastScrollPos = state.scrollPos;
    };

    // Standard Intersection Observer for elements and grids (fallback/staggered reveal)
    const initScrollTriggers = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        // Scroll reveals for layout elements
        const elementObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        scrollRevealElements.forEach(el => {
            elementObserver.observe(el);
        });

        // Image reveal wrappers with masking overlay
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealImgWrappers.forEach(wrap => {
            imageObserver.observe(wrap);
        });

        // Numeric counters for stats section
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberEl = entry.target;
                    const target = parseInt(numberEl.getAttribute('data-target'));
                    animateCounter(numberEl, target);
                    observer.unobserve(numberEl);
                }
            });
        }, observerOptions);

        statNumbers.forEach(num => {
            counterObserver.observe(num);
        });

        // Initialize GSAP horizontal scrolling for selected works
        initGsapHorizontalScroll();
    };

    // GSAP Horizontal Scroll Showcase for desktop
    const initGsapHorizontalScroll = () => {
        const track = document.querySelector('.works-scroll-track');
        if (!track || !window.gsap || !window.ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);
        
        let mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const slides = gsap.utils.toArray('.works-slide');
            const scrollAmount = track.scrollWidth - window.innerWidth;
            
            // Primary horizontal slide animation
            const scrollTween = gsap.to(track, {
                x: -scrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: ".works-section",
                    pin: true,
                    scrub: 0.8,
                    start: "top top",
                    end: () => `+=${scrollAmount}`,
                    invalidateOnRefresh: true,
                }
            });

            // Image Parallax scroll inside each project slide
            slides.forEach(slide => {
                const img = slide.querySelector('.project-slide-img');
                const info = slide.querySelector('.project-slide-info');
                
                if (img) {
                    gsap.fromTo(img, 
                        { xPercent: -12, scale: 1.08 },
                        { 
                            xPercent: 12,
                            scale: 1.02,
                            ease: "none",
                            scrollTrigger: {
                                trigger: slide,
                                containerAnimation: scrollTween,
                                start: "left right",
                                end: "right left",
                                scrub: true
                            }
                        }
                    );
                }
                
                if (info) {
                    gsap.fromTo(info, 
                        { xPercent: 10, opacity: 0.3 },
                        { 
                            xPercent: 0,
                            opacity: 1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: slide,
                                containerAnimation: scrollTween,
                                start: "left right",
                                end: "left center",
                                scrub: true
                            }
                        }
                    );
                }
            });
        });
    };

    // Helper: Stat number count ticker
    const animateCounter = (el, target) => {
        if (!target || target <= 0) {
            el.textContent = target || 0;
            return;
        }
        let current = 0;
        const duration = 2000; // ms
        const stepTime = Math.abs(Math.floor(duration / target));
        
        const timer = setInterval(() => {
            current += 1;
            el.textContent = current;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            }
        }, stepTime);
    };


    /* 5.5 BLUEPRINT BEFORE/AFTER SLIDER INTERACTION
       ========================================================================== */
    const initBlueprintSlider = () => {
        const slider = document.getElementById('blueprint-slider');
        if (!slider) return;

        const handle = slider.querySelector('.slider-handle');
        const blueprint = slider.querySelector('.slider-blueprint');
        let isDragging = false;

        const setSliderPos = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            let percentage = (offsetX / rect.width) * 100;

            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;

            blueprint.style.width = `${percentage}%`;
            handle.style.left = `${percentage}%`;
        };

        const startDragging = () => {
            isDragging = true;
            body.classList.add('cursor-expand');
        };

        const stopDragging = () => {
            isDragging = false;
            body.classList.remove('cursor-expand');
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            setSliderPos(clientX);
        };

        // Event Listeners for dragging
        handle.addEventListener('mousedown', startDragging);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mousemove', dragMove);

        // Mobile touch events
        handle.addEventListener('touchstart', startDragging, { passive: true });
        window.addEventListener('touchend', stopDragging);
        window.addEventListener('touchmove', dragMove, { passive: false });

        // Click to slide transition
        slider.addEventListener('click', (e) => {
            if (e.target.closest('.slider-handle')) return;
            setSliderPos(e.clientX);
        });

        // Initialize state to 50%
        blueprint.style.width = '50%';
        handle.style.left = '50%';
    };


    /* 6. DRAWER MENU SYSTEM
       ========================================================================== */
    const toggleMenu = () => {
        if (state.menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    const openMenu = () => {
        state.menuOpen = true;
        body.classList.add('menu-active');
        
        // GSAP enhancements for menu elements if available
        if (window.gsap) {
            gsap.fromTo('.menu-drawer-link', 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.1, delay: 0.3 }
            );
        }
    };

    const closeMenu = () => {
        state.menuOpen = false;
        body.classList.remove('menu-active');
    };


    /* 7. BLACK & WHITE THEME TOGGLE
       ========================================================================== */
    const toggleTheme = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', state.theme);
        
        // Smooth transition effect
        html.setAttribute('data-theme', state.theme);
        updateThemeButtonUI();
    };

    const updateThemeButtonUI = () => {
        if (state.theme === 'dark') {
            themeToggleText.textContent = 'BLANC';
        } else {
            themeToggleText.textContent = 'NOIR';
        }
    };


    /* 8. FORM SUBMIT HANDLER
       ========================================================================== */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const services = document.getElementById('services').value;
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !services || !message) {
            showFeedback('Please fill out all required fields.', 'error');
            return;
        }

        // Simulating editorial API submit state
        const submitBtn = contactForm.querySelector('.btn-submit');
        const submitBtnText = submitBtn.querySelector('span');
        const originalText = submitBtnText.textContent;
        
        submitBtn.disabled = true;
        submitBtnText.textContent = 'TRANSMITTING...';

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtnText.textContent = originalText;
            
            showFeedback('Dialogue initiated. Our team will contact you shortly.', 'success');
            contactForm.reset();
        }, 1800);
    }

    const showFeedback = (msg, type) => {
        formFeedback.textContent = msg;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.style.opacity = '1';

        setTimeout(() => {
            formFeedback.style.opacity = '0';
        }, 5000);
    };

    // Run Initialization
    init();
});
