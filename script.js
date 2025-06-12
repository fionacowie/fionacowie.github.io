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
});

// Page Transitions functionality - COMPREHENSIVE SAFARI FIX
function initPageTransitions() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip transitions if user prefers reduced motion

    // Track if we're currently in a transition to avoid conflicts
    let isTransitioning = false;
    
    // SAFARI FIX: Track navigation method to distinguish between custom transitions and browser navigation
    let isCustomNavigation = false;

    // Intercept case study links on home page
    const caseStudyLinks = document.querySelectorAll('a[href*="case-study"]');
    caseStudyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only intercept if it's a normal click (not browser navigation)
            if (e.isTrusted && !isTransitioning) {
                e.preventDefault();
                isTransitioning = true;
                isCustomNavigation = true;
                const targetUrl = this.href;
                
                // Set transition direction for next page
                sessionStorage.setItem('transitionDirection', 'to-case-study');
                sessionStorage.setItem('customNavigation', 'true');
                
                // Play exit animation then navigate
                playExitAnimation('slide-out-to-left', targetUrl);
            }
        });
    });

    // Intercept back-to-home links on case study pages - BUT ONLY FOR DIRECT CLICKS
    const backHomeLinks = document.querySelectorAll('a[href*="index.html"], .back-home');
    backHomeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // CRITICAL FIX: Only intercept trusted user clicks, not programmatic navigation
            // This allows Safari's back button to work normally
            if (e.isTrusted && !isTransitioning && !e.defaultPrevented) {
                e.preventDefault();
                isTransitioning = true;
                isCustomNavigation = true;
                const targetUrl = this.href || 'index.html';
                
                // Set transition direction for next page
                sessionStorage.setItem('transitionDirection', 'to-home');
                sessionStorage.setItem('customNavigation', 'true');
                
                // Play exit animation then navigate
                playExitAnimation('slide-out-to-right', targetUrl);
            }
        });
    });

    // SAFARI FIX: Handle browser back/forward navigation (popstate)
    window.addEventListener('popstate', function(e) {
        console.log('Popstate event triggered - browser navigation detected');
        
        // Clear any transition flags when browser navigates naturally
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
        isTransitioning = false;
        isCustomNavigation = false;
        
        // SAFARI FIX: Force page to be visible immediately on browser navigation
        const main = document.querySelector('main');
        if (main) {
            main.style.transform = 'translateX(0)';
            main.style.opacity = '1';
            main.style.visibility = 'visible';
            main.classList.remove('page-transitioning', 'slide-in-from-right', 'slide-in-from-left', 'slide-out-to-left', 'slide-out-to-right');
        }
        
        // Clear any CSS custom properties that might be hiding content
        document.documentElement.style.removeProperty('--initial-transform');
        document.documentElement.style.removeProperty('--initial-opacity');
        document.documentElement.style.removeProperty('--initial-visibility');
        
        // Let browser handle navigation naturally - no interference
    });

    // SAFARI FIX: Handle page show event (important for Safari's back/forward cache)
    window.addEventListener('pageshow', function(e) {
        console.log('Pageshow event triggered, persisted:', e.persisted);
        
        // If page is loaded from cache (Safari's back/forward cache)
        if (e.persisted) {
            // Clear all transition states
            sessionStorage.removeItem('transitionDirection');
            sessionStorage.removeItem('customNavigation');
            isTransitioning = false;
            isCustomNavigation = false;
            
            // Force page to be visible
            const main = document.querySelector('main');
            if (main) {
                main.style.transform = 'translateX(0)';
                main.style.opacity = '1';
                main.style.visibility = 'visible';
                main.classList.remove('page-transitioning', 'slide-in-from-right', 'slide-in-from-left', 'slide-out-to-left', 'slide-out-to-right');
            }
            
            // Clear CSS custom properties
            document.documentElement.style.removeProperty('--initial-transform');
            document.documentElement.style.removeProperty('--initial-opacity');
            document.documentElement.style.removeProperty('--initial-visibility');
        }
    });

    // Reset transition flag when page loads
    window.addEventListener('load', function() {
        isTransitioning = false;
        
        // SAFARI FIX: Extra safety check - if this is not a custom navigation, ensure page is visible
        const isCustomNav = sessionStorage.getItem('customNavigation') === 'true';
        if (!isCustomNav) {
            const main = document.querySelector('main');
            if (main) {
                main.style.transform = 'translateX(0)';
                main.style.opacity = '1';
                main.style.visibility = 'visible';
            }
            
            document.documentElement.style.removeProperty('--initial-transform');
            document.documentElement.style.removeProperty('--initial-opacity');
            document.documentElement.style.removeProperty('--initial-visibility');
            
            // Clean up any stray session storage
            sessionStorage.removeItem('transitionDirection');
            sessionStorage.removeItem('customNavigation');
        }
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
    if (prefersReducedMotion) return; // Skip transitions if user prefers reduced motion

    const transitionDirection = sessionStorage.getItem('transitionDirection');
    const isCustomNav = sessionStorage.getItem('customNavigation') === 'true';
    const main = document.querySelector('main');
    
    console.log('HandlePageEntrance - transitionDirection:', transitionDirection, 'isCustomNav:', isCustomNav);
    
    // SAFARI FIX: Only apply entrance animations if this was a custom navigation
    if (transitionDirection && isCustomNav) {
        // Remove the direction from storage
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
        
        // Clear the CSS custom properties and make page visible
        document.documentElement.style.removeProperty('--initial-transform');
        document.documentElement.style.removeProperty('--initial-opacity');
        document.documentElement.style.removeProperty('--initial-visibility');
        
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
        // SAFARI FIX: If this is not a custom navigation (e.g., browser back button), 
        // ensure page is immediately visible without any transitions
        document.documentElement.style.removeProperty('--initial-transform');
        document.documentElement.style.removeProperty('--initial-opacity');
        document.documentElement.style.removeProperty('--initial-visibility');
        
        if (main) {
            main.style.transform = 'translateX(0)';
            main.style.opacity = '1';
            main.style.visibility = 'visible';
            main.classList.remove('page-transitioning', 'slide-in-from-right', 'slide-in-from-left', 'slide-out-to-left', 'slide-out-to-right');
        }
        
        // Clean up session storage
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
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

// DEBUG VERSION: Scroll spy functionality with console logging
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
        
        // DEBUG: Log current values
        console.log('Nav height:', navHeight);
        console.log('Current scroll Y:', window.scrollY);
        console.log('Calculated scroll position:', scrollPosition);
        
        let currentSection = '';
        
        // DEBUG: Log all section positions
        sections.forEach(section => {
            console.log(`Section ${section.id}:`, section.offsetTop);
        });
        
        // Check if we're on mobile (where we want contact to be separate)
        const isMobile = window.innerWidth <= 768;
        
        // SPECIAL CASE: Check if we're in the contact section first (all screen sizes)
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            // FIXED: Adjust threshold for taller screens - if contact section is close to being in view
            const contactThreshold = contactSection.offsetTop - (window.innerHeight * 0.3); // 30% of viewport height before contact section
            if (scrollPosition >= contactThreshold) {
                currentSection = 'contact';
                console.log('Found current section (contact special case):', currentSection);
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
                    console.log('Found current section:', currentSection);
                    break; // Stop at the first (most recent) section we find
                }
            }
        }
        
        // If we're at the very top, don't highlight anything
        if (window.scrollY < 50) {
            currentSection = '';
            console.log('At top, clearing section');
        }
        
        console.log('Final current section:', currentSection);
        
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
                console.log('Setting active link for:', currentSection, activeLink);
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
            });
            
            if (activeLinks.length === 0) {
                console.log('Could not find any nav links for section:', currentSection);
            }
        }
        
        console.log('---');
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