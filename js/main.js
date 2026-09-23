document.addEventListener('DOMContentLoaded', function() {
    // ===================
    // Theme Switcher (Dark / Light)
    // ===================
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    const initialTheme = savedTheme ? savedTheme : 'dark';
    
    applyTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
            if (theme === 'light') {
                themeIcon.className = 'fas fa-moon';
                themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
            } else {
                themeIcon.className = 'fas fa-sun';
                themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
            }
        }
    }

    // ===================
    // Mobile menu toggle
    // ===================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
    
    // ===================
    // Skills filter - instant switching
    // ===================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillItems = document.querySelectorAll('.skill-item');

    const defaultFilterBtn = document.querySelector('.filter-btn[data-filter="languages"]');
    if (defaultFilterBtn) {
        defaultFilterBtn.classList.add('active');
        filterSkills('languages');
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterSkills(this.getAttribute('data-filter'));
        });
    });

    function filterSkills(filter) {
        skillItems.forEach(item => {
            item.style.display = item.getAttribute('data-category') === filter ? 'flex' : 'none';
        });
    }

    // ===================
    // Certifications View More/Less
    // ===================
    const viewMoreBtn = document.getElementById('viewMoreBtn');
    const hiddenCertifications = document.querySelectorAll('.hidden-certification');
    let showingAll = false;

    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', function() {
            showingAll = !showingAll;
            
            if (showingAll) {
                hiddenCertifications.forEach(cert => cert.style.display = 'flex');
                this.textContent = 'Show Less';
            } else {
                hiddenCertifications.forEach(cert => cert.style.display = 'none');
                this.textContent = 'View All Certifications';
            }
            
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    }

    // ===================
    // Contact Form Submission (EmailJS + Instant Mailto Fallback)
    // ===================
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init("0lu19pdJHn8_VJ6zt"); // EmailJS Public Key
        } catch (e) {
            console.warn('EmailJS init warning:', e);
        }
    }

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            const originalBtnText = btnText.textContent;
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim() || 'Portfolio Contact Inquiry';
            const message = document.getElementById('message').value.trim();
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnIcon.classList.replace('fa-paper-plane', 'fa-spinner');
            btnIcon.classList.add('fa-spin');
            
            const formData = {
                name: name,
                from_name: name,
                email: email,
                reply_to: email,
                subject: subject,
                title: subject,
                message: message
            };

            const triggerMailtoFallback = (noticeText) => {
                const mailtoUrl = `mailto:shyameshkomatla@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message)}`;
                window.location.href = mailtoUrl;
                formStatus.innerHTML = `<i class="fas fa-envelope-circle-check"></i> ${noticeText || 'Opening email client to send your message directly to shyameshkomatla@gmail.com...'}`;
                formStatus.className = 'success';
                contactForm.reset();
            };

            // If running on local file system, EmailJS blocks requests due to null origin
            if (window.location.protocol === 'file:' || typeof emailjs === 'undefined') {
                setTimeout(() => {
                    triggerMailtoFallback('Opening your email app to send directly to Shyamesh...');
                    submitBtn.disabled = false;
                    btnText.textContent = originalBtnText;
                    btnIcon.classList.replace('fa-spinner', 'fa-paper-plane');
                    btnIcon.classList.remove('fa-spin');
                }, 400);
                return;
            }

            // Hosted environment: send via EmailJS
            emailjs.send("service_r200ndt", "template_94kueda", formData)
            .then(function() {
                // Send confirmation to user (optional, don't fail if this template fails)
                try {
                    emailjs.send("service_r200ndt", "template_pebcfhf", formData).catch(() => {});
                } catch(err) {}
                
                formStatus.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
                formStatus.className = 'success';
                contactForm.reset();
            })
            .catch(function(error) {
                console.warn('EmailJS API encounter:', error);
                // Graceful fallback: trigger direct mailto so user is never stranded
                triggerMailtoFallback('Message prepared! Opening email client to send directly to shyameshkomatla@gmail.com...');
            })
            .finally(() => {
                submitBtn.disabled = false;
                btnText.textContent = originalBtnText;
                btnIcon.classList.replace('fa-spinner', 'fa-paper-plane');
                btnIcon.classList.remove('fa-spin');
                
                setTimeout(() => {
                    if (formStatus) formStatus.style.display = 'none';
                }, 7000);
            });
        });
    }

    // ===================
    // Smooth scrolling for navigation links
    // ===================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===================
    // Navbar scroll animation
    // ===================
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Add active class to current section in navigation
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});