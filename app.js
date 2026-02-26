// Application Data
const appData = {
    users: [
        {"id": 1, "name": "Alex Kumar", "username": "@alexk", "problemsShared": 12, "problemsSolved": 8, "followers": 245, "following": 189, "posts": 34},
        {"id": 2, "name": "Priya Singh", "username": "@priyasingh", "problemsShared": 15, "problemsSolved": 22, "followers": 432, "following": 267, "posts": 56},
        {"id": 3, "name": "Rahul Sharma", "username": "@rahuls", "problemsShared": 7, "problemsSolved": 18, "followers": 189, "following": 145, "posts": 23}
    ],
    problems: [
        {"id": 1, "title": "How to reduce plastic waste in daily life?", "description": "I'm looking for practical ways to minimize plastic consumption at home", "author": "Alex Kumar", "category": "Environment", "timestamp": "2 hours ago", "helpOffers": 5, "solved": false},
        {"id": 2, "title": "Need help with time management as a student", "description": "Struggling to balance studies, part-time job, and personal life", "author": "Priya Singh", "category": "Lifestyle", "timestamp": "1 day ago", "helpOffers": 12, "solved": false},
        {"id": 3, "title": "Best budget-friendly healthy meal prep ideas?", "description": "Looking for nutritious meal prep options under ₹200 per day", "author": "Rahul Sharma", "category": "Health", "timestamp": "3 days ago", "helpOffers": 8, "solved": true}
    ],
    solutions: [
        {"id": 1, "problemId": 1, "title": "Switch to reusable alternatives", "description": "Replace single-use items with reusable bags, bottles, containers", "author": "Priya Singh", "upvotes": 15, "timestamp": "1 hour ago"},
        {"id": 2, "problemId": 2, "title": "Time-blocking technique", "description": "Use calendar blocking to allocate specific time slots for each activity", "author": "Alex Kumar", "upvotes": 23, "timestamp": "12 hours ago"}
    ],
    posts: [
        {"id": 1, "type": "text", "content": "Just helped someone solve their plastic waste problem! Feels great to contribute to a cleaner environment 🌱", "author": "Priya Singh", "timestamp": "3 hours ago", "likes": 28, "comments": 5},
        {"id": 2, "type": "image", "content": "My latest meal prep solutions - healthy and budget-friendly! 🥗", "author": "Rahul Sharma", "timestamp": "1 day ago", "likes": 45, "comments": 12},
        {"id": 3, "type": "reel", "content": "Quick productivity tips that actually work! ⚡", "author": "Alex Kumar", "timestamp": "2 days ago", "likes": 67, "comments": 18, "views": 234}
    ],
    messages: [
        {"id": 1, "sender": "Priya Singh", "message": "Thanks for the great solution to my time management question!", "timestamp": "1 hour ago", "read": true},
        {"id": 2, "sender": "Rahul Sharma", "message": "Would love to collaborate on more environment-friendly initiatives", "timestamp": "2 hours ago", "read": false}
    ],
    currentUser: {
        "name": "Alex Kumar",
        "username": "@alexk", 
        "problemsShared": 12,
        "problemsSolved": 8,
        "followers": 245,
        "following": 189,
        "posts": 34,
        "joinDate": "March 2025",
        "bio": "Problem solver | Environment enthusiast | Helping make the world a better place"
    }
};

// Application State
let currentView = 'login';
let currentSection = 'dashboard';
let currentFilter = 'all';
let currentFeed = 'posts';

// Authentication Flow Tracking - FIXED
let authFlow = ''; // Track whether user came from 'signup' or 'forgot' password

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    initializeEventListeners();
    showPage('loginPage');
});

// Authentication Functions
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Hide all auth pages
    const authPages = document.querySelectorAll('.auth-page');
    authPages.forEach(page => page.classList.remove('active'));
    
    // Hide main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.classList.remove('active');
    }
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        currentView = pageId;
    } else {
        console.error('Page not found:', pageId);
    }
}

function showMainApp() {
    console.log('Showing main app...');
    
    // Clear auth flow state when user successfully enters main app
    authFlow = '';
    
    // Hide all auth pages
    const authPages = document.querySelectorAll('.auth-page');
    authPages.forEach(page => page.classList.remove('active'));
    
    // Show main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.classList.add('active');
        currentView = 'mainApp';
        
        // Load initial data
        setTimeout(() => {
            loadDashboard();
            loadProblems();
            loadFeed();
            loadMessages();
            loadProfile();
        }, 100);
    }
}

// Logout Function - NEW
function handleLogout() {
    console.log('Logging out user...');
    
    // Clear authentication state
    authFlow = '';
    currentView = 'login';
    currentSection = 'dashboard';
    
    // Reset forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Reset button states
    const buttons = document.querySelectorAll('.auth-btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.textContent = btn.textContent.includes('Sign') ? 'Sign In' : 
                         btn.textContent.includes('Create') ? 'Create Account' :
                         btn.textContent.includes('Send') ? 'Send Reset Link' :
                         btn.textContent.includes('Verify') ? 'Verify' :
                         btn.textContent.includes('Reset') ? 'Reset Password' : btn.textContent;
    });
    
    // Clear OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => input.value = '');
    
    // Show login page
    showPage('loginPage');
    
    console.log('User logged out successfully');
}

// Main App Navigation
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Update nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId + 'Section');
    const targetNavBtn = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
    }
    
    if (targetNavBtn) {
        targetNavBtn.classList.add('active');
    }
}

// Event Listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Authentication Forms - using more reliable event binding
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    const otpForm = document.getElementById('otpForm');
    const resetForm = document.getElementById('resetForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener attached');
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        console.log('Signup form listener attached');
    }
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
        console.log('Forgot form listener attached');
    }
    
    if (otpForm) {
        otpForm.addEventListener('submit', handleOTPVerification);
        console.log('OTP form listener attached');
    }
    
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
        console.log('Reset form listener attached');
    }
    
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = btn.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tabs .tab-btn');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update filter and reload problems
            currentFilter = tab.getAttribute('data-filter');
            loadProblems();
        });
    });
    
    // Feed Tabs
    const feedTabs = document.querySelectorAll('.feed-tabs .tab-btn');
    feedTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Update active tab
            feedTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update feed and reload
            currentFeed = tab.getAttribute('data-feed');
            loadFeed();
        });
    });
    
    // Profile Tabs
    const profileTabs = document.querySelectorAll('.profile-tabs .tab-btn');
    profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Update active tab
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Load profile content
            const tabType = tab.getAttribute('data-tab');
            loadProfileTab(tabType);
        });
    });
    
    // Modal Forms
    const shareProblemForm = document.getElementById('shareProblemForm');
    const createPostForm = document.getElementById('createPostForm');
    
    if (shareProblemForm) {
        shareProblemForm.addEventListener('submit', handleShareProblem);
    }
    
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePost);
    }
    
    // OTP Input Navigation
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
    
    // Page navigation links - attach to document for event delegation
    document.addEventListener('click', function(e) {
        // Handle auth page navigation
        if (e.target.getAttribute('onclick')) {
            e.preventDefault();
            const onclickAttr = e.target.getAttribute('onclick');
            if (onclickAttr.includes('showPage')) {
                const pageMatch = onclickAttr.match(/showPage\('([^']+)'\)/);
                if (pageMatch) {
                    showPage(pageMatch[1]);
                }
            }
        }
        
        // Close modals when clicking outside
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    console.log('Event listeners initialized');
}

// Authentication Handlers - FIXED FLOWS
function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login attempt   with:', { email, password: '***' });
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        console.log('Login successful, transitioning to main app...');
        // Show loading state
        const submitBtn = e.target.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;
        
        // Clear any existing auth flow
        authFlow = '';
        
        setTimeout(() => {
            showMainApp();
        }, 1000);
    } else {
        console.log('Login failed: Missing email or password');
        alert('Please fill in all fields');
    }
}

function handleSignup(e) {
    e.preventDefault();
    console.log('Signup form submitted');
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (name && email && password) {
        console.log('Signup successful, showing OTP page...');
        const submitBtn = e.target.querySelector('.auth-btn');
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        // Set auth flow to signup - FIXED
        authFlow = 'signup';
        console.log('Auth flow set to:', authFlow);
        
        setTimeout(() => {
            showPage('otpPage');
        }, 1000);
    } else {
        alert('Please fill in all fields');
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    console.log('Forgot password form submitted');
    
    const email = document.getElementById('forgotEmail').value;
    
    if (email) {
        console.log('Reset email sent, showing OTP page...');
        const submitBtn = e.target.querySelector('.auth-btn');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Set auth flow to forgot - FIXED
        authFlow = 'forgot';
        console.log('Auth flow set to:', authFlow);
        
        setTimeout(() => {
            showPage('otpPage');
        }, 1000);
    } else {
        alert('Please enter your email address');
    }
}

function handleOTPVerification(e) {
    e.preventDefault();
    console.log('OTP form submitted');
    
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    if (otp.length === 6) {
        console.log('OTP verified, proceeding based on auth flow:', authFlow);
        const submitBtn = e.target.querySelector('.auth-btn');
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // FIXED: Use authFlow instead of currentView to determine next step
            if (authFlow === 'signup') {
                console.log('Signup flow completed, going to main app');
                showMainApp(); // Go to main app after signup OTP
            } else if (authFlow === 'forgot') {
                console.log('Forgot password flow, going to reset page');
                showPage('resetPage'); // Go to reset password after forgot OTP
            } else {
                console.warn('Unknown auth flow:', authFlow, 'defaulting to main app');
                showMainApp(); // Default fallback
            }
        }, 1000);
    } else {
        alert('Please enter the complete 6-digit code');
    }
}

function handlePasswordReset(e) {
    e.preventDefault();
    console.log('Password reset form submitted');
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
        console.log('Password reset successful');
        const submitBtn = e.target.querySelector('.auth-btn');
        submitBtn.textContent = 'Resetting...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Clear auth flow state when reset is complete
            authFlow = '';
            showPage('loginPage');
            alert('Password reset successfully! Please login with your new password.');
        }, 1000);
    } else if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
    } else {
        alert('Please fill in all fields');
    }
}

// Data Loading Functions
function loadDashboard() {
    console.log('Dashboard loaded');
}

function loadProblems() {
    const problemsList = document.getElementById('problemsList');
    if (!problemsList) return;
    
    let filteredProblems = appData.problems;
    
    if (currentFilter === 'solved') {
        filteredProblems = appData.problems.filter(p => p.solved);
    } else if (currentFilter === 'unsolved') {
        filteredProblems = appData.problems.filter(p => !p.solved);
    }
    
    problemsList.innerHTML = filteredProblems.map(problem => `
        <div class="problem-card">
            <div class="problem-header">
                <div class="problem-category">${problem.category}</div>
                ${problem.solved ? '<div class="solved-badge">Solved</div>' : ''}
            </div>
            <h3 class="problem-title">${problem.title}</h3>
            <p class="problem-description">${problem.description}</p>
            <div class="problem-meta">
                <div class="problem-author">By ${problem.author} • ${problem.timestamp}</div>
                <div class="problem-actions">
                    ${!problem.solved ? `<button class="help-btn"><i class="fas fa-hand-helping"></i> Help (${problem.helpOffers})</button>` : ''}
                    <button class="comment-btn"><i class="fas fa-comment"></i> Discuss</button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Problems loaded:', filteredProblems.length);
}

function loadFeed() {
    const feedList = document.getElementById('feedList');
    if (!feedList) return;
    
    let filteredPosts = appData.posts;
    
    if (currentFeed === 'reels') {
        filteredPosts = appData.posts.filter(p => p.type === 'reel');
    }
    
    feedList.innerHTML = filteredPosts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">${post.author}</div>
                <div class="post-type">${post.type.toUpperCase()}</div>
            </div>
            <p class="post-content">${post.content}</p>
            ${post.type === 'reel' ? `<div class="post-views">${post.views} views</div>` : ''}
            <div class="post-meta">
                <div class="post-timestamp">${post.timestamp}</div>
                <div class="post-actions">
                    <button class="like-btn"><i class="fas fa-heart"></i> ${post.likes}</button>
                    <button class="comment-btn"><i class="fas fa-comment"></i> ${post.comments}</button>
                    <button class="comment-btn"><i class="fas fa-share"></i> Share</button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Feed loaded:', filteredPosts.length);
}

function loadMessages() {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    chatList.innerHTML = appData.messages.map(message => `
        <div class="chat-item ${!message.read ? 'unread' : ''}" onclick="openChat('${message.sender}')">
            <div class="chat-item-name">${message.sender}</div>
            <div class="chat-item-message">${message.message}</div>
            <div class="chat-item-time">${message.timestamp}</div>
        </div>
    `).join('');
    
    console.log('Messages loaded:', appData.messages.length);
}

function loadProfile() {
    const user = appData.currentUser;
    loadProfileTab('activity');
    console.log('Profile loaded for:', user.name);
}

function loadProfileTab(tabType) {
    const tabContent = document.getElementById('profileTabContent');
    if (!tabContent) return;
    
    switch(tabType) {
        case 'activity':
            tabContent.innerHTML = `
                <div class="activity-list">
                    <div class="activity-item">
                        <div class="activity-icon solved">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>Solved a problem:</strong> "Time management for students"</p>
                            <span class="activity-time">2 hours ago</span>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon shared">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>Shared a problem:</strong> "Reducing plastic waste"</p>
                            <span class="activity-time">1 day ago</span>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'problems':
            const userProblems = appData.problems.filter(p => p.author === appData.currentUser.name);
            tabContent.innerHTML = userProblems.map(problem => `
                <div class="problem-card">
                    <div class="problem-header">
                        <div class="problem-category">${problem.category}</div>
                        ${problem.solved ? '<div class="solved-badge">Solved</div>' : ''}
                    </div>
                    <h3 class="problem-title">${problem.title}</h3>
                    <p class="problem-description">${problem.description}</p>
                </div>
            `).join('');
            break;
        case 'solutions':
            const userSolutions = appData.solutions.filter(s => s.author === appData.currentUser.name);
            tabContent.innerHTML = userSolutions.map(solution => `
                <div class="post-card">
                    <h3 class="post-author">${solution.title}</h3>
                    <p class="post-content">${solution.description}</p>
                    <div class="post-meta">
                        <div class="post-timestamp">${solution.timestamp}</div>
                        <div class="post-actions">
                            <button class="like-btn"><i class="fas fa-thumbs-up"></i> ${solution.upvotes}</button>
                        </div>
                    </div>
                </div>
            `).join('');
            break;
    }
    
    console.log('Profile tab loaded:', tabType);
}

// Modal Functions
function openShareProblemModal() {
    const modal = document.getElementById('shareProblemModal');
    modal.classList.add('active');
    console.log('Share problem modal opened');
}

function openCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    modal.classList.add('active');
    console.log('Create post modal opened');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    console.log('Modal closed:', modalId);
}

function openChat(senderName) {
    const chatHeader = document.querySelector('.chat-header h4');
    const chatMessages = document.getElementById('chatMessages');
    
    chatHeader.textContent = senderName;
    
    // Simulate chat messages
    chatMessages.innerHTML = `
        <div class="message received">
            <div class="message-content">${appData.messages.find(m => m.sender === senderName)?.message}</div>
            <div class="message-time">${appData.messages.find(m => m.sender === senderName)?.timestamp}</div>
        </div>
    `;
    
    // Update active chat item
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));
    event.target.closest('.chat-item').classList.add('active');
    
    console.log('Chat opened with:', senderName);
}

// Form Handlers
function handleShareProblem(e) {
    e.preventDefault();
    console.log('Share problem form submitted');
    
    const title = document.getElementById('problemTitle').value;
    const description = document.getElementById('problemDescription').value;
    const category = document.getElementById('problemCategory').value;
    
    if (title && description && category) {
        // Add to problems list (simulation)
        const newProblem = {
            id: appData.problems.length + 1,
            title: title,
            description: description,
            author: appData.currentUser.name,
            category: category,
            timestamp: "Just now",
            helpOffers: 0,
            solved: false
        };
        
        appData.problems.unshift(newProblem);
        
        // Update dashboard stats
        appData.currentUser.problemsShared++;
        
        // Close modal and refresh
        closeModal('shareProblemModal');
        loadProblems();
        
        // Reset form
        document.getElementById('shareProblemForm').reset();
        
        console.log('New problem shared:', newProblem);
    } else {
        alert('Please fill in all fields');
    }
}

function handleCreatePost(e) {
    e.preventDefault();
    console.log('Create post form submitted');
    
    const type = document.getElementById('postType').value;
    const content = document.getElementById('postContent').value;
    
    if (type && content) {
        // Add to posts list (simulation)
        const newPost = {
            id: appData.posts.length + 1,
            type: type,
            content: content,
            author: appData.currentUser.name,
            timestamp: "Just now",
            likes: 0,
            comments: 0
        };
        
        if (type === 'reel') {
            newPost.views = 0;
        }
        
        appData.posts.unshift(newPost);
        
        // Update dashboard stats
        appData.currentUser.posts++;
        
        // Close modal and refresh
        closeModal('createPostModal');
        loadFeed();
        
        // Reset form
        document.getElementById('createPostForm').reset();
        
        console.log('New post created:', newPost);
    } else {
        alert('Please fill in all fields');
    }
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getTimeAgo(timestamp) {
    // This would normally calculate actual time difference
    return timestamp;
}

// Global functions for onclick handlers
window.showPage = showPage;
window.openShareProblemModal = openShareProblemModal;
window.openCreatePostModal = openCreatePostModal;
window.closeModal = closeModal;
window.openChat = openChat;
window.handleLogout = handleLogout; // NEW - Added to global scope

// Add some CSS for message styling
const messageStyles = `
    .message {
        margin-bottom: 12px;
        max-width: 70%;
    }
    
    .message.received {
        align-self: flex-start;
    }
    
    .message.sent {
        align-self: flex-end;
        margin-left: auto;
    }
    
    .message-content {
        background: rgba(243, 164, 255, 0.2);
        padding: 12px 16px;
        border-radius: 16px;
        color: #fff;
        font-size: 14px;
        margin-bottom: 4px;
    }
    
    .message.sent .message-content {
        background: #f3a4ff;
        color: #1a1a2e;
    }
    
    .message-time {
        font-size: 10px;
        color: #bbb;
        text-align: right;
    }
    
    .message.received .message-time {
        text-align: left;
    }
    
    .chat-item.unread {
        background: rgba(243, 164, 255, 0.1);
        border-left: 3px solid #f3a4ff;
    }
`;

// Inject message styles
const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);

console.log('Application JavaScript loaded successfully with FIXED authentication flows and LOGOUT functionality');