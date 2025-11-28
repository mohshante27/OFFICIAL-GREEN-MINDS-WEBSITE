// script.js - Simplified with Working Looping Sliders

document.addEventListener('DOMContentLoaded', function() {
    console.log('Green Minds - Initializing all sliders...');
    
    // Initialize all functionality
    initMobileNavigation();
    updateBreadcrumb();
    initSearch();
    initSlideshow();
    initTeamSlider();
    initPartnersSlider();
    initCoreValuesScrolling();
});

// Mobile Navigation
function initMobileNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const headerNavContent = document.getElementById('headerNavContent');
    
    if (mobileMenuBtn && headerNavContent) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            headerNavContent.classList.toggle('mobile-open');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.header-nav-container')) {
                headerNavContent.classList.remove('mobile-open');
            }
        });
    }
}

// Breadcrumb
function updateBreadcrumb() {
    const currentPage = window.location.pathname.split('/').pop();
    const pageName = currentPage.replace('.html', '').replace(/-/g, ' ');
    const breadcrumbElement = document.getElementById('currentPage');
    
    if (breadcrumbElement && pageName !== 'index') {
        breadcrumbElement.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    } else if (breadcrumbElement) {
        breadcrumbElement.textContent = 'Home';
    }
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    const searchData = [
        { title: "About Us", description: "Learn about our mission and vision", url: "pages/about.html" },
        { title: "Projects", description: "Our environmental initiatives", url: "pages/projects.html" },
        { title: "Donate", description: "Support our cause", url: "pages/donate.html" },
        { title: "Contact", description: "Get in touch with us", url: "pages/contact.html" }
    ];
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
        
        displayResults(results);
    }
    
    function displayResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `<h4>${result.title}</h4><p>${result.description}</p>`;
                item.addEventListener('click', () => {
                    window.location.href = result.url;
                });
                searchResults.appendChild(item);
            });
        }
        
        searchResults.style.display = 'block';
    }
    
    searchInput.addEventListener('input', performSearch);
    searchButton.addEventListener('click', performSearch);
}

// MAIN SLIDESHOW - SIMPLE LOOPING VERSION
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) {
        console.log('No slides found');
        return;
    }
    
    let currentSlide = 0;
    
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.style.display = 'none';
            slide.classList.remove('active');
        });
        
        // Remove active from all dots
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide (with looping)
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        
        slides[currentSlide].style.display = 'block';
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Initialize first slide
    showSlide(0);
    
    // Auto-advance every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Add event listeners for manual controls
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Dot controls
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    console.log('Main slideshow initialized with', slides.length, 'slides');
}

// TEAM SLIDER - SIMPLE LOOPING VERSION
function initTeamSlider() {
    const slider = document.querySelector('.team-slider');
    const slides = document.querySelectorAll('.team-slide');
    const prevBtn = document.querySelector('.team-slider-btn.prev');
    const nextBtn = document.querySelector('.team-slider-btn.next');
    
    if (!slider || slides.length === 0) {
        console.log('Team slider not found');
        return;
    }
    
    let currentIndex = 0;
    const slidesPerView = getTeamSlidesPerView();
    
    function getTeamSlidesPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }
    
    function updateSlider() {
        const slideWidth = slides[0].offsetWidth + 25;
        const maxIndex = Math.max(0, slides.length - getTeamSlidesPerView());
        
        // Loop handling
        if (currentIndex > maxIndex) currentIndex = 0;
        if (currentIndex < 0) currentIndex = maxIndex;
        
        slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        updateTeamDots();
    }
    
    function updateTeamDots() {
        const dots = document.querySelectorAll('.team-slider-dot');
        const activeDotIndex = Math.floor(currentIndex / getTeamSlidesPerView());
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
    
    function nextSlide() {
        currentIndex++;
        updateSlider();
    }
    
    function prevSlide() {
        currentIndex--;
        updateSlider();
    }
    
    // Initialize
    updateSlider();
    
    // Auto-advance
    setInterval(nextSlide, 4000);
    
    // Manual controls
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Dot controls
    const dots = document.querySelectorAll('.team-slider-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index * getTeamSlidesPerView();
            updateSlider();
        });
    });
    
    // Handle resize
    window.addEventListener('resize', updateSlider);
    
    console.log('Team slider initialized with', slides.length, 'slides');
}

// PARTNERS SLIDER - SIMPLE LOOPING VERSION
function initPartnersSlider() {
    const slider = document.querySelector('.partners-slider');
    const slides = document.querySelectorAll('.partner-card');
    const prevBtn = document.querySelector('.partner-slider-btn.prev');
    const nextBtn = document.querySelector('.partner-slider-btn.next');
    
    if (!slider || slides.length === 0) {
        console.log('Partners slider not found');
        return;
    }
    
    let currentIndex = 0;
    const slidesPerView = getPartnerSlidesPerView();
    
    function getPartnerSlidesPerView() {
        if (window.innerWidth < 768) return 2;
        if (window.innerWidth < 1024) return 3;
        return 4;
    }
    
    function updateSlider() {
        const slideWidth = slides[0].offsetWidth + 30;
        const maxIndex = Math.max(0, slides.length - getPartnerSlidesPerView());
        
        // Loop handling
        if (currentIndex > maxIndex) currentIndex = 0;
        if (currentIndex < 0) currentIndex = maxIndex;
        
        slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        updatePartnerDots();
    }
    
    function updatePartnerDots() {
        const dots = document.querySelectorAll('.partner-slider-dot');
        const activeDotIndex = Math.floor(currentIndex / getPartnerSlidesPerView());
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
    
    function nextSlide() {
        currentIndex++;
        updateSlider();
    }
    
    function prevSlide() {
        currentIndex--;
        updateSlider();
    }
    
    // Initialize
    updateSlider();
    
    // Auto-advance
    setInterval(nextSlide, 3500);
    
    // Manual controls
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Dot controls
    const dots = document.querySelectorAll('.partner-slider-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index * getPartnerSlidesPerView();
            updateSlider();
        });
    });
    
    // Handle resize
    window.addEventListener('resize', updateSlider);
    
    console.log('Partners slider initialized with', slides.length, 'slides');
}

// Core Values Scrolling
function initCoreValuesScrolling() {
    const scrollContainer = document.getElementById('valuesScroll');
    if (!scrollContainer) return;
    
    const leftBtn = document.querySelector('.scroll-btn.left');
    const rightBtn = document.querySelector('.scroll-btn.right');
    
    if (leftBtn) {
        leftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

// Make functions available globally for HTML onclick handlers
window.plusSlides = function(n) {
    const slides = document.querySelectorAll('.slide');
    const currentSlide = document.querySelector('.slide.active');
    let currentIndex = Array.from(slides).indexOf(currentSlide);
    let newIndex = currentIndex + n;
    
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    // Hide all slides
    slides.forEach(slide => {
        slide.style.display = 'none';
        slide.classList.remove('active');
    });
    
    // Show new slide
    slides[newIndex].style.display = 'block';
    slides[newIndex].classList.add('active');
    
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[newIndex]) dots[newIndex].classList.add('active');
};

window.currentSlide = function(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    // Hide all slides
    slides.forEach(slide => {
        slide.style.display = 'none';
        slide.classList.remove('active');
    });
    
    // Remove active from all dots
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show selected slide
    slides[n - 1].style.display = 'block';
    slides[n - 1].classList.add('active');
    dots[n - 1].classList.add('active');
};

window.scrollValues = function(direction) {
    const scrollContainer = document.getElementById('valuesScroll');
    if (scrollContainer) {
        scrollContainer.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
};