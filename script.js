// Portfolio Website JavaScript
// Handles navigation, smooth scrolling, mobile menu functionality, and page transitions

// Immediate visibility check on script load
(function() {
    const main = document.querySelector('main');
    if (main && window.location.pathname.includes('.html')) {
        // Force visibility if we detect any transform issues
        const computedStyle = window.getComputedStyle(main);
        if (computedStyle.opacity === '0' || 
            computedStyle.visibility === 'hidden' ||
            computedStyle.transform.includes('translate')) {
            main.style.transition = 'none';
            main.style.transform = 'translateX(0)';
            main.style.opacity = '1';
            main.style.visibility = 'visible';
            // Re-enable transitions after a brief delay
            setTimeout(() => {
                main.style.transition = '';
            }, 100);
        }
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initMobileMenu();
    initSmoothScrolling();
    initScrollSpy();
    initKeyboardNavigation();
    initPageTransitions();
    handlePageEntrance();
});

// Page Transitions functionality - ENHANCED WITH BETTER STATE MANAGEMENT
function initPageTransitions() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Track if we're currently in a transition to avoid conflicts
    let isTransitioning = false;
    
    // ENHANCED: Add transition queue to prevent overlapping transitions
    let transitionQueue = [];
    let isProcessingQueue = false;
    
    // ENHANCED: Clear any stale session storage on page load
    const currentTime = Date.now();
    const transitionTimestamp = sessionStorage.getItem('transitionTimestamp');
    if (transitionTimestamp && currentTime - parseInt(transitionTimestamp) > 2000) {
        // Clear stale transition data older than 2 seconds
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
        sessionStorage.removeItem('transitionTimestamp');
    }
    
    // ENHANCED: Ensure page is visible on load (failsafe)
    const ensurePageVisible = () => {
        const main = document.querySelector('main');
        if (main) {
            main.style.transform = 'translateX(0)';
            main.style.opacity = '1';
            main.style.visibility = 'visible';
            main.classList.remove('page-transitioning', 'slide-in-from-right', 'slide-in-from-left', 'slide-out-to-left', 'slide-out-to-right');
        }
        document.documentElement.style.removeProperty('--initial-transform');
        document.documentElement.style.removeProperty('--initial-opacity');
        document.documentElement.style.removeProperty('--initial-visibility');
    };
    
    // Process transition queue
    const processTransitionQueue = () => {
        if (isProcessingQueue || transitionQueue.length === 0) return;
        
        isProcessingQueue = true;
        const nextTransition = transitionQueue.shift();
        
        if (nextTransition) {
            nextTransition();
        }
        
        // Allow next transition after current one completes
        setTimeout(() => {
            isProcessingQueue = false;
            processTransitionQueue();
        }, 300); // Match your transition duration
    };
    
    // Enhanced transition handler with queue
    const handleTransition = (e, link, direction, targetUrl) => {
        e.preventDefault();
        
        // Add to queue instead of executing immediately
        transitionQueue.push(() => {
            isTransitioning = true;
            
            // Set transition direction for next page with timestamp
            sessionStorage.setItem('transitionDirection', direction);
            sessionStorage.setItem('customNavigation', 'true');
            sessionStorage.setItem('transitionTimestamp', Date.now().toString());
            
            // Play exit animation then navigate
            playExitAnimation(
                direction === 'to-case-study' ? 'slide-out-to-left' : 'slide-out-to-right',
                targetUrl
            );
        });
        
        processTransitionQueue();
    };

    // Intercept case study links on home page
    const caseStudyLinks = document.querySelectorAll('a[href*="case-study"]');
    caseStudyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (e.isTrusted && !isTransitioning) {
                handleTransition(e, this, 'to-case-study', this.href);
            }
        });
    });

    // Intercept back-to-home links on case study pages
    const backHomeLinks = document.querySelectorAll('a[href*="index.html"], .back-home');
    backHomeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (e.isTrusted && !isTransitioning && !e.defaultPrevented) {
                const targetUrl = this.href || 'index.html';
                handleTransition(e, this, 'to-home', targetUrl);
            }
        });
    });

    // ENHANCED: Handle browser back/forward navigation
    window.addEventListener('popstate', function(e) {
        // Cancel any pending transitions
        transitionQueue = [];
        isProcessingQueue = false;
        isTransitioning = false;
        
        // Clear transition state
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
        sessionStorage.removeItem('transitionTimestamp');
        
        // Force immediate visibility
        ensurePageVisible();
    });

    // ENHANCED: Handle page show event
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            // Page loaded from cache
            transitionQueue = [];
            isProcessingQueue = false;
            isTransitioning = false;
            
            sessionStorage.removeItem('transitionDirection');
            sessionStorage.removeItem('customNavigation');
            sessionStorage.removeItem('transitionTimestamp');
            
            ensurePageVisible();
        }
    });

    // ENHANCED: Additional failsafe on visibility change
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Check if we're stuck in a transition state
            const transitionTimestamp = sessionStorage.getItem('transitionTimestamp');
            if (transitionTimestamp) {
                const elapsed = Date.now() - parseInt(transitionTimestamp);
                if (elapsed > 1000) {
                    // Transition should have completed by now
                    ensurePageVisible();
                    sessionStorage.removeItem('transitionDirection');
                    sessionStorage.removeItem('customNavigation');
                    sessionStorage.removeItem('transitionTimestamp');
                }
            }
        }
    });

    // Enhanced beforeunload handler
    window.addEventListener('beforeunload', function() {
        // Clear all transition states when leaving page
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
        sessionStorage.removeItem('transitionTimestamp');
        
        // Cancel any pending animations
        const main = document.querySelector('main');
        if (main) {
            main.style.transition = 'none';
            const animations = main.getAnimations();
            animations.forEach(animation => animation.cancel());
        }
    });

    // Mutation observer as last resort
    const observer = new MutationObserver(function(mutations) {
        const main = document.querySelector('main');
        if (!main) return;
        
        // Check if main is stuck in invisible state
        const computedStyle = window.getComputedStyle(main);
        const isInvisible = computedStyle.opacity === '0' || 
                           computedStyle.visibility === 'hidden';
        const hasTransform = computedStyle.transform !== 'none' && 
                            computedStyle.transform !== 'matrix(1, 0, 0, 1, 0, 0)';
        
        // If stuck and not actively transitioning
        if ((isInvisible || hasTransform) && !main.classList.contains('page-transitioning')) {
            const transitionTimestamp = sessionStorage.getItem('transitionTimestamp');
            const now = Date.now();
            
            // If no active transition or transition is stale
            if (!transitionTimestamp || (now - parseInt(transitionTimestamp) > 1000)) {
                console.warn('Detected stuck transition state, forcing visibility');
                main.style.transition = 'none';
                main.style.transform = 'translateX(0)';
                main.style.opacity = '1';
                main.style.visibility = 'visible';
                main.classList.remove('slide-in-from-right', 'slide-in-from-left', 
                                     'slide-out-to-left', 'slide-out-to-right');
                
                // Re-enable transitions
                setTimeout(() => {
                    main.style.transition = '';
                }, 100);
            }
        }
    });

    // Start observing after DOM is loaded
    const main = document.querySelector('main');
    if (main) {
        observer.observe(main, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    // Reset on page load
    window.addEventListener('load', function() {
        isTransitioning = false;
        transitionQueue = [];
        isProcessingQueue = false;
        
        const isCustomNav = sessionStorage.getItem('customNavigation') === 'true';
        if (!isCustomNav) {
            ensurePageVisible();
            sessionStorage.removeItem('transitionDirection');
            sessionStorage.removeItem('customNavigation');
            sessionStorage.removeItem('transitionTimestamp');
        }
    });
}

function playExitAnimation(animationClass, targetUrl) {
    const main = document.querySelector('main');
    
    // Add transition class
    main.classList.add('page-transitioning');
    main.classList.add(animationClass);
    
    // Get animation duration
    const duration = 250; // Your transition duration
    
    // Navigate after animation completes
    setTimeout(() => {
        window.location.href = targetUrl;
    }, duration);
}

function handlePageEntrance() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const transitionDirection = sessionStorage.getItem('transitionDirection');
    const isCustomNav = sessionStorage.getItem('customNavigation') === 'true';
    const transitionTimestamp = sessionStorage.getItem('transitionTimestamp');
    const main = document.querySelector('main');
    
    // ENHANCED: Check if transition data is stale
    let isStale = false;
    if (transitionTimestamp) {
        const elapsed = Date.now() - parseInt(transitionTimestamp);
        isStale = elapsed > 2000; // Consider stale after 2 seconds
    }
    
    if (transitionDirection && isCustomNav && !isStale) {
        // Valid transition data - proceed with animation
        sessionStorage.removeItem('transitionDirection');
        sessionStorage.removeItem('customNavigation');
        sessionStorage.removeItem('transitionTimestamp');
        
        // Clear the CSS custom properties
        document.documentElement.style.removeProperty('--initial-transform');
        document.documentElement.style.removeProperty('--initial-opacity');
        document.documentElement.style.removeProperty('--initial-visibility');
        
        // Add page transitioning class
        main.classList.add('page-transitioning');
        
        if (transitionDirection === 'to-case-study') {
            main.classList.add('slide-in-from-right');
            
            setTimeout(() => {
                main.classList.remove('page-transitioning', 'slide-in-from-right');
                // Final visibility check
                main.style.transform = '';
                main.style.opacity = '';
                main.style.visibility = '';
            }, 300);
            
        } else if (transitionDirection === 'to-home') {
            main.classList.add('slide-in-from-left');
            
            setTimeout(() => {
                main.classList.remove('page-transitioning', 'slide-in-from-left');
                // Final visibility check
                main.style.transform = '';
                main.style.opacity = '';
                main.style.visibility = '';
            }, 300);
        }
    } else {
        // No valid transition or stale data - ensure immediate visibility
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
        sessionStorage.removeItem('transitionTimestamp');
    }
    
    // Additional failsafe check after entrance should complete
    setTimeout(() => {
        const main = document.querySelector('main');
        if (main) {
            const computedStyle = window.getComputedStyle(main);
            if (computedStyle.opacity === '0' || computedStyle.visibility === 'hidden') {
                console.warn('Page still invisible after entrance, forcing visibility');
                main.style.transition = 'none';
                main.style.transform = 'translateX(0)';
                main.style.opacity = '1';
                main.style.visibility = 'visible';
                setTimeout(() => {
                    main.style.transition = '';
                }, 50);
            }
        }
    }, 500); // Check half a second after page should have loaded
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