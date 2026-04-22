/**
 * AI产业链投资研究报告 - 交互逻辑
 * 包含：滚动动画、数字计数、进度条、导航高亮
 */

(function() {
    'use strict';

    // ========================================
    // 工具函数
    // ========================================

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

    // ========================================
    // 滚动进度条
    // ========================================

    function updateProgressBar() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        const progressBar = document.getElementById('progressBar');

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }

    // ========================================
    // 导航高亮
    // ========================================

    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ========================================
    // 滚动动画 (Intersection Observer)
    // ========================================

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '[data-animate], .insight-card, .chain-layer, .opportunity-matrix, .track-card, .timeline-item'
        );

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');

                    const countElement = entry.target.querySelector('[data-count]');
                    if (countElement) {
                        animateCount(countElement);
                    }
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ========================================
    // 数字计数动画
    // ========================================

    function animateCount(element) {
        const target = parseFloat(element.dataset.count);
        const duration = 1500;
        const startTime = performance.now();
        const isDecimal = target % 1 !== 0;

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentValue = target * easeProgress;

            if (isDecimal) {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
            }
        }

        requestAnimationFrame(updateCount);
    }

    // ========================================
    // Header 显示/隐藏
    // ========================================

    let lastScrollTop = 0;
    let ticking = false;

    function handleHeaderVisibility() {
        const header = document.getElementById('header');
        const scrollTop = window.scrollY;

        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollTop = scrollTop;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateProgressBar();
                updateActiveNav();
                handleHeaderVisibility();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ========================================
    // 平滑滚动到锚点
    // ========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // 数字动画初始化
    // ========================================

    function initVisibleCountAnimations() {
        const countElements = document.querySelectorAll('.metric-value[data-count]');

        countElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                animateCount(el);
            }
        });
    }

    // ========================================
    // 初始化
    // ========================================

    function init() {
        window.addEventListener('scroll', debounce(onScroll, 10), { passive: true });

        setTimeout(initVisibleCountAnimations, 100);

        initScrollAnimations();
        initSmoothScroll();

        updateProgressBar();
        updateActiveNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
