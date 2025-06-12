// Portfolio Website JavaScript
// Handles navigation, smooth scrolling, mobile menu functionality, and page transitions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initMobileMenu();
    initSmoothScrolling();
    initScrollSpy();
    initKeyboardNavigation();
    initPageTransitions(); // Add page transitions
    handlePageEntrance(); // Handle page entrance animations
    
    // SAFEGUARD: Add loaded class after a short delay to ensure visibility
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Page Transitions functionality
function initPageTransitions() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip transitions if user prefers reduced motion

    // Intercept case study links on home page
    const caseStudyLinks = document.querySelectorAll('a[href*="case-study"]');
    caseStudyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.href;
            
            // Set transition direction for next page
            sessionStorage.setItem('transitionDirection', 'to-case-study');
            
            // Play exit animation then navigate
            playExitAnimation('slide-out-to-left', targetUrl);
        });
    });

    // Intercept back-to-home links on case study pages
    const backHomeLinks = document.querySelectorAll('a[href*="index.html"], .back-home');
    backHomeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.href || 'index.html';
            
            // Set transition direction for next page
            sessionStorage.setItem('transitionDirection', 'to-home');
            
            // Play exit animation then navigate
            playExitAnimation('slide-out-to-right', targetUrl);
        });
    });
}

function playExitAnimation(animationClass, targetUrl) {
    const main = document.querySelector('main');
    
    // Add transition class
    main.classList.add('page-transitioning');
    main.classList.add(animationClass);
    
    // Get animation duration - MUCH FASTER NOW
    const duration = animationClass.includes('slide-out-to-left') ? 250 : 250; // Both directions now 250ms for snappy feel
    
    // Navigate after animation completes
    setTimeout(() => {
        window.location.href = targetUrl;
    }, duration);
}

function handlePageEntrance() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Clear any CSS properties that might hide content
        document.documentElement.style.removeProperty('--initial-transform');
        document.documentElement.style.removeProperty('--initial-opacity');
        document.documentElement.style.removeProperty('--initial-visibility');
        return;
    }

    const transitionDirection = sessionStorage.getItem('transitionDirection');
    const main = document.querySelector('main');
    
    // CRITICAL FIX: Always clear CSS properties to ensure page is visible
    // This prevents blank screen when using browser navigation
    document.documentElement.style.removeProperty('--initial-transform');
    document.documentElement.style.removeProperty('--initial-opacity');
    document.documentElement.style.removeProperty('--initial-visibility');
    
    if (transitionDirection) {
        // Remove the direction from storage
        sessionStorage.removeItem('transitionDirection');
        
        // Add page transitioning class
        main.classList.add('page-transitioning');
        
        if (transitionDirection === 'to-case-study') {
            // Coming from home to case study - slide in from right (300ms)
            main.classList.add('slide-in-from-right');
            
            // Remove animation class after completion
            setTimeout(() => {
                main.classList.remove('page-transitioning', 'slide-in-from-right');
            }, 300);
            
        } else if (transitionDirection === 'to-home') {
            // Coming from case study to home - slide in from left (300ms)
            main.classList.add('slide-in-from-left');
            
            // Remove animation class after completion
            setTimeout(() => {
                main.classList.remove('page-transitioning', 'slide-in-from-left');
            }, 300);
        }
    } else {
        // No transition direction set (browser navigation) - ensure page is visible
        // Remove any transition classes that might have been left
        main.classList.remove('page-transitioning', 'slide-in-from-right', 'slide-in-from-left');
    }
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                scrollToElement(targetElement);
                closeMobileMenu();
                updateActiveNavItem(this);
            }
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (!mobileToggle || !mobileNav) return;
    
    mobileToggle.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // Close mobile menu when clicking on nav links
    const mobileNavLinks = mobileNav.querySelectorAll('.nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileToggle.contains(e.target) && !mobileNav.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Handle escape key to close mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    mobileNav.classList.toggle('show');
    
    // Manage focus
    if (!isExpanded) {
        // Menu is opening - focus first menu item
        const firstLink = mobileNav.querySelector('.nav-link');
        if (firstLink) {
            firstLink.focus();
        }
    }
}

function closeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (!mobileToggle || !mobileNav) return;
    
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('show');
}

// Smooth scrolling functionality
function initSmoothScrolling() {
    // Handle logo click to scroll to top
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToTop();
            closeMobileMenu();
        });
    }
    
    // Handle all anchor links with smooth scrolling
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        // Skip if already handled by navigation
        if (link.classList.contains('nav-link') || link.classList.contains('logo')) {
            return;
        }
        
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                scrollToElement(targetElement);
            }
        });
    });
}

function scrollToElement(element) {
    // UPDATED: Use dynamic nav height calculation instead of hardcoded value
    const navElement = document.querySelector('.main-nav');
    const navHeight = navElement ? navElement.offsetHeight : 88;
    
    // Special handling for contact section (which is inside about section)
    let targetPosition;
    if (element.id === 'contact') {
        // FIXED: For contact, ensure we scroll far enough to trigger the scroll spy
        // Account for the viewport-based threshold we use in scroll spy
        const extraOffset = window.innerHeight * 0.3; // Match the scroll spy threshold
        targetPosition = element.offsetTop - navHeight - 8 - extraOffset;
    } else {
        // For other sections, align section title bottom with nav bottom
        targetPosition = element.offsetTop - navHeight - 8;
    }
    
    // Check user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        window.scrollTo(0, targetPosition);
    } else {
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function scrollToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        window.scrollTo(0, 0);
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Scroll spy functionality
function initScrollSpy() {
    if (!document.querySelector('.main-nav')) return; // Only on home page
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    function updateActiveNavOnScroll() {
        // FIXED: Dynamically get the current nav height instead of hardcoding
        const navElement = document.querySelector('.main-nav');
        const navHeight = navElement ? navElement.offsetHeight : 88;
        const scrollPosition = window.scrollY + navHeight + 50;
        
        let currentSection = '';
        
        // Check if we're on mobile (where we want contact to be separate)
        const isMobile = window.innerWidth <= 768;
        
        // SPECIAL CASE: Check if we're in the contact section first (all screen sizes)
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            // FIXED: Adjust threshold for taller screens - if contact section is close to being in view
            const contactThreshold = contactSection.offsetTop - (window.innerHeight * 0.3); // 30% of viewport height before contact section
            if (scrollPosition >= contactThreshold) {
                currentSection = 'contact';
            }
        }
        
        // If we didn't find contact section, proceed with normal detection
        if (!currentSection) {
            // FIXED: Find the most recently passed section by iterating in reverse order
            const sectionsArray = Array.from(sections).reverse();
            
            for (const section of sectionsArray) {
                // Skip contact section since we handled it above
                if (section.id === 'contact') continue;
                
                const sectionTop = section.offsetTop;
                
                // If we've scrolled past this section's top, it's our current section
                if (scrollPosition >= sectionTop) {
                    currentSection = section.getAttribute('id');
                    break; // Stop at the first (most recent) section we find
                }
            }
        }
        
        // If we're at the very top, don't highlight anything
        if (window.scrollY < 50) {
            currentSection = '';
        }
        
        // Clear all active states first - this ensures only one is ever active
        // FIXED: Clear both desktop AND mobile nav links
        const allNavLinks = document.querySelectorAll('.nav-link[data-section]');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            // ADDED: Force remove any stuck focus/hover states
            link.blur();
        });
        
        // Set active state for the single current section
        if (currentSection) {
            // FIXED: Apply active class to BOTH desktop and mobile nav links
            const activeLinks = document.querySelectorAll(`.nav-link[data-section="${currentSection}"]`);
            activeLinks.forEach(activeLink => {
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
            });
        }
    }
    
    // UPDATED: Reduced throttling for more responsive updates
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavOnScroll, 5);
    });
    
    // Initial call
    updateActiveNavOnScroll();
}

function updateActiveNavItem(clickedLink) {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    // UPDATED: Ensure only one item is active at a time
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });
    
    clickedLink.classList.add('active');
    clickedLink.setAttribute('aria-current', 'page');
}

// Enhanced keyboard navigation
function initKeyboardNavigation() {
    // Handle keyboard navigation for mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
    }
    
    // Handle keyboard navigation within mobile menu
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                handleMobileMenuTabbing(e);
            }
        });
    }
    
    // Handle focus management for case study cards
    const caseStudyCards = document.querySelectorAll('.case-study-card');
    caseStudyCards.forEach(card => {
        const link = card.querySelector('.card-link');
        if (link) {
            // Ensure card is focusable via keyboard
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    // Let the default behavior handle the navigation
                    return;
                }
            });
        }
    });
}

function handleMobileMenuTabbing(e) {
    const mobileNav = document.querySelector('.mobile-nav');
    const focusableElements = mobileNav.querySelectorAll('a, button, [tabindex]');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    } else {
        // Tab
        if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
}

// Utility function to preserve scroll position when navigating to case studies
function preserveScrollPosition() {
    if (document.referrer.includes(window.location.origin)) {
        // Store scroll position before leaving
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    }
}

// Restore scroll position when returning from case studies
function restoreScrollPosition() {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('scrollPosition');
    }
}

// Enhanced error handling and accessibility features
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Handle reduced motion preferences
function handleMotionPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function updateMotionPreferences(mediaQuery) {
        if (mediaQuery.matches) {
            // User prefers reduced motion
            document.documentElement.style.setProperty('scroll-behavior', 'auto');
        } else {
            // User is okay with motion
            document.documentElement.style.setProperty('scroll-behavior', 'smooth');
        }
    }
    
    // Initial check
    updateMotionPreferences(prefersReducedMotion);
    
    // Listen for changes
    prefersReducedMotion.addEventListener('change', updateMotionPreferences);
}

// Initialize motion preferences
document.addEventListener('DOMContentLoaded', handleMotionPreferences);

// Performance optimization: Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize for responsive adjustments
window.addEventListener('resize', debounce(function() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}, 250));