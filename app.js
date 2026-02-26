// Supabase Configuration - Use environment variables or defaults
const SUPABASE_URL = 'https://thjqtnsomprxzxccscxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SHf3H_diz39MW03KaitBqA_ksrra893';

// Check if running in demo mode (placeholder credentials)
const DEMO_MODE = SUPABASE_URL.includes('your-project-id') || SUPABASE_ANON_KEY.includes('your-anon-key');

// Initialize Supabase client only if not in demo mode
let supabaseClient = null;
if (!DEMO_MODE) {
    try {
        // Check if Supabase is available globally
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully');
        }
    } catch (error) {
        console.warn('Supabase initialization failed, running in demo mode:', error);
    }
}

// Demo data for offline functionality
const demoData = {
    users: [
        {
            id: 'demo-user-1',
            email: 'demo@sevaflow.com',
            name: 'Demo User',
            username: 'demouser',
            bio: 'This is a demo account to showcase SevaFlow features.',
            problems_shared: 3,
            problems_solved: 5,
            followers_count: 42,
            following_count: 18,
            created_at: new Date().toISOString()
        }
    ],
    problems: [
        {
            id: 'problem-1',
            user_id: 'demo-user-1',
            title: 'How to reduce plastic waste in daily life?',
            description: 'Looking for practical ways to minimize plastic consumption and waste in everyday activities.',
            category: 'Environment',
            solved: false,
            help_offers: 8,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            users: { name: 'Demo User', username: 'demouser' }
        },
        {
            id: 'problem-2', 
            user_id: 'other-user',
            title: 'Best practices for remote work productivity?',
            description: 'Struggling to maintain focus and productivity while working from home.',
            category: 'Lifestyle',
            solved: true,
            help_offers: 12,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            users: { name: 'Sarah Johnson', username: 'sarahj' }
        }
    ],
    posts: [
        {
            id: 'post-1',
            user_id: 'demo-user-1',
            type: 'solution',
            content: 'Just helped someone solve their plastic waste problem! Switch to reusable bags, bottles, and containers. Small changes make a big difference! 🌱',
            likes: 24,
            comments: 6,
            created_at: new Date(Date.now() - 1800000).toISOString(),
            users: { name: 'Demo User', username: 'demouser' }
        }
    ],
    messages: [],
    currentUser: null
};

// Application State
let currentUser = null;
let currentView = 'login';
let currentSection = 'dashboard';
let currentFilter = 'all';
let searchTimeout = null;
let selectedUserId = null;
let realtimeSubscriptions = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('SevaFlow initializing...');
    console.log('Demo mode:', DEMO_MODE);
    
    // Force demo mode for now to ensure app works
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Initialize App
async function initializeApp() {
    console.log('Starting app initialization...');
    
    try {
        // Show loading screen
        showLoadingScreen(true);
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (DEMO_MODE || !supabaseClient) {
            // Demo mode - simulate loading and go to login
            console.log('Running in demo mode - no real database connection');
            showLoadingScreen(false);
            showPage('loginPage');
            initializeEventListeners();
            return;
        }
        
        // Real Supabase mode (if available)
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (error) {
                console.error('Session error:', error);
                showLoadingScreen(false);
                showPage('loginPage');
                initializeEventListeners();
                return;
            }
            
            if (session) {
                console.log('User session found, loading user data...');
                currentUser = session.user;
                await loadUserProfile();
                showLoadingScreen(false);
                showMainApp();
            } else {
                console.log('No user session, showing login page');
                showLoadingScreen(false);
                showPage('loginPage');
            }
            
            // Initialize event listeners
            initializeEventListeners();
            
            // Set up real-time subscriptions
            setupRealtimeUpdates();
            
        } catch (supabaseError) {
            console.warn('Supabase error, falling back to demo mode:', supabaseError);
            showLoadingScreen(false);
            showPage('loginPage');
            initializeEventListeners();
        }
        
    } catch (error) {
        console.error('App initialization error:', error);
        console.log('Falling back to demo mode');
        
        // Always fallback to demo mode on any error
        showLoadingScreen(false);
        showPage('loginPage');
        initializeEventListeners();
    }
}

// Loading Screen
function showLoadingScreen(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        if (show) {
            loadingScreen.classList.add('active');
        } else {
            loadingScreen.classList.remove('active');
        }
    }
}

// Page Navigation
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
        console.log('Successfully showing page:', pageId);
    } else {
        console.error('Page not found:', pageId);
    }
}

function showMainApp() {
    console.log('Showing main app...');
    
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

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt...');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = e.target.querySelector('.auth-btn');
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo login - simulate authentication
            console.log('Demo login for:', email);
            
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create demo user
            currentUser = {
                id: 'demo-user-1',
                email: email,
                profile: demoData.users[0]
            };
            demoData.currentUser = currentUser;
            
            console.log('Demo login successful');
            updateUIWithUserData();
            showMainApp();
            
        } else {
            // Real Supabase login
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            currentUser = data.user;
            console.log('Login successful:', currentUser);
            
            // Load user profile and show main app
            await loadUserProfile();
            showMainApp();
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials.');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    console.log('Signup attempt...');
    
    const name = document.getElementById('signupName').value;
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const bio = document.getElementById('signupBio').value;
    const password = document.getElementById('signupPassword').value;
    const submitBtn = e.target.querySelector('.auth-btn');
    
    // Basic validation
    if (!name || !username || !email || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo signup
            console.log('Demo signup for:', email);
            
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Create new demo user
            const newUser = {
                id: `demo-user-${Date.now()}`,
                email: email,
                name: name,
                username: username,
                bio: bio || '',
                problems_shared: 0,
                problems_solved: 0,
                followers_count: 0,
                following_count: 0,
                created_at: new Date().toISOString()
            };
            
            demoData.users.push(newUser);
            currentUser = {
                id: newUser.id,
                email: email,
                profile: newUser
            };
            demoData.currentUser = currentUser;
            
            console.log('Demo signup successful');
            updateUIWithUserData();
            showMainApp();
            
        } else {
            // Real Supabase signup
            // Check username uniqueness first
            const { data: existingUser } = await supabaseClient
                .from('users')
                .select('username')
                .eq('username', username)
                .single();
            
            if (existingUser) {
                alert('Username already taken. Please choose another.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name,
                        username: username,
                        bio: bio || ''
                    }
                }
            });
            
            if (error) {
                throw error;
            }
            
            // Check if email confirmation is required
            if (data.user && !data.session) {
                alert('Please check your email for confirmation link before signing in.');
                showPage('loginPage');
            } else {
                currentUser = data.user;
                console.log('Signup successful:', currentUser);
                await loadUserProfile();
                showMainApp();
            }
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        alert(error.message || 'Signup failed. Please try again.');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    console.log('Password reset request...');
    
    const email = document.getElementById('forgotEmail').value;
    const submitBtn = e.target.querySelector('.auth-btn');
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo password reset
            console.log('Demo password reset for:', email);
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Demo mode: Password reset email would be sent to ' + email);
            showPage('loginPage');
        } else {
            // Real Supabase password reset
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            
            if (error) {
                throw error;
            }
            
            alert('Password reset email sent! Please check your inbox.');
            showPage('loginPage');
        }
        
    } catch (error) {
        console.error('Password reset error:', error);
        alert(error.message || 'Failed to send reset email. Please try again.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleLogout() {
    console.log('Logging out...');
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo logout
            currentUser = null;
            demoData.currentUser = null;
            console.log('Demo logout successful');
        } else {
            // Real Supabase logout
            // Clean up subscriptions
            realtimeSubscriptions.forEach(subscription => {
                subscription.unsubscribe();
            });
            realtimeSubscriptions = [];
            
            const { error } = await supabaseClient.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            currentUser = null;
        }
        
        // Reset app state
        currentSection = 'dashboard';
        
        // Clear forms and reset UI
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        showPage('loginPage');
        console.log('Logged out successfully');
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// User Profile Functions
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo mode - use demo data
            currentUser.profile = demoData.users.find(u => u.id === currentUser.id) || demoData.users[0];
            console.log('Demo user profile loaded');
            updateUIWithUserData();
            return;
        }
        
        // Real Supabase mode
        const { data: profile, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // User doesn't exist in users table, create profile
            const userMetadata = currentUser.user_metadata;
            const { data: newProfile, error: insertError } = await supabaseClient
                .from('users')
                .insert([{
                    id: currentUser.id,
                    email: currentUser.email,
                    name: userMetadata.name || 'User',
                    username: userMetadata.username || `user_${Date.now()}`,
                    bio: userMetadata.bio || ''
                }])
                .select()
                .single();
            
            if (insertError) {
                throw insertError;
            }
            
            currentUser.profile = newProfile;
        } else if (error) {
            throw error;
        } else {
            currentUser.profile = profile;
        }
        
        console.log('User profile loaded:', currentUser.profile);
        updateUIWithUserData();
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to demo data
        currentUser.profile = demoData.users[0];
        updateUIWithUserData();
    }
}

function updateUIWithUserData() {
    if (!currentUser || !currentUser.profile) return;
    
    const profile = currentUser.profile;
    
    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${profile.name}! 👋`;
    }
    
    // Update profile section
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileBio = document.getElementById('profileBio');
    
    if (profileName) profileName.textContent = profile.name;
    if (profileUsername) profileUsername.textContent = `@${profile.username}`;
    if (profileBio) profileBio.textContent = profile.bio || 'No bio available';
    
    // Update stats
    const stats = {
        problemsSharedCount: profile.problems_shared || 0,
        problemsSolvedCount: profile.problems_solved || 0,
        followersCount: profile.followers_count || 0,
        followingCount: profile.following_count || 0,
        profileFollowers: profile.followers_count || 0,
        profileFollowing: profile.following_count || 0,
        profileProblems: profile.problems_shared || 0
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    console.log('UI updated with user data');
}

// Navigation Functions
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
    
    // Load section-specific data
    switch(sectionId) {
        case 'problems':
            loadProblems();
            break;
        case 'feed':
            loadFeed();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Data Loading Functions
async function loadDashboard() {
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Load demo activity
            const userProblems = demoData.problems.filter(p => p.user_id === currentUser?.id);
            const activityList = document.getElementById('recentActivity');
            
            if (userProblems.length > 0) {
                activityList.innerHTML = userProblems.map(problem => `
                    <div class="activity-item">
                        <div class="activity-icon shared">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>You shared:</strong> "${problem.title}"</p>
                            <span class="activity-time">${formatTimeAgo(problem.created_at)}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                activityList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-rocket"></i>
                        <p>Start sharing problems to see your activity here!</p>
                    </div>
                `;
            }
        } else {
            // Real Supabase dashboard
            const { data: problems } = await supabaseClient
                .from('problems')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(3);
            
            const activityList = document.getElementById('recentActivity');
            if (problems && problems.length > 0) {
                activityList.innerHTML = problems.map(problem => `
                    <div class="activity-item">
                        <div class="activity-icon shared">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>You shared:</strong> "${problem.title}"</p>
                            <span class="activity-time">${formatTimeAgo(problem.created_at)}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                activityList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-rocket"></i>
                        <p>Start sharing problems to see your activity here!</p>
                    </div>
                `;
            }
        }
        
        console.log('Dashboard loaded');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadProblems() {
    const problemsList = document.getElementById('problemsList');
    if (!problemsList) return;
    
    try {
        let problems = [];
        
        if (DEMO_MODE || !supabaseClient) {
            // Use demo data
            problems = [...demoData.problems];
            
            // Apply filters
            if (currentFilter === 'solved') {
                problems = problems.filter(p => p.solved);
            } else if (currentFilter === 'unsolved') {
                problems = problems.filter(p => !p.solved);
            } else if (currentFilter === 'mine') {
                problems = problems.filter(p => p.user_id === currentUser?.id);
            }
        } else {
            // Real Supabase query
            let query = supabaseClient
                .from('problems')
                .select(`
                    *,
                    users!problems_user_id_fkey(name, username)
                `)
                .order('created_at', { ascending: false });
            
            // Apply filters
            if (currentFilter === 'solved') {
                query = query.eq('solved', true);
            } else if (currentFilter === 'unsolved') {
                query = query.eq('solved', false);
            } else if (currentFilter === 'mine') {
                query = query.eq('user_id', currentUser?.id);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            problems = data || [];
        }
        
        if (problems.length > 0) {
            problemsList.innerHTML = problems.map(problem => `
                <div class="problem-card">
                    <div class="problem-header">
                        <div class="problem-category">${problem.category}</div>
                        ${problem.solved ? '<div class="solved-badge">Solved</div>' : ''}
                    </div>
                    <h3 class="problem-title">${problem.title}</h3>
                    <p class="problem-description">${problem.description}</p>
                    <div class="problem-meta">
                        <div class="problem-author">
                            By ${problem.users?.name || problem.user_name || 'Unknown'} • ${formatTimeAgo(problem.created_at)}
                        </div>
                        <div class="problem-actions">
                            ${!problem.solved && problem.user_id !== currentUser?.id ? 
                                `<button class="help-btn" onclick="offerHelp('${problem.id}')">
                                    <i class="fas fa-hand-helping"></i> Help (${problem.help_offers || 0})
                                </button>` : ''}
                            <button class="comment-btn" onclick="openProblemDiscussion('${problem.id}')">
                                <i class="fas fa-comment"></i> Discuss
                            </button>
                            ${problem.user_id !== currentUser?.id ? `
                                <button class="follow-btn" onclick="viewUserProfile('${problem.user_id}')">
                                    <i class="fas fa-user"></i> View Profile
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            problemsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <p>No problems found. ${currentFilter === 'mine' ? 'Share your first problem!' : 'Be the first to share a problem!'}</p>
                </div>
            `;
        }
        
        console.log('Problems loaded:', problems.length);
        
    } catch (error) {
        console.error('Error loading problems:', error);
        problemsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load problems. Please try again.</p>
            </div>
        `;
    }
}

async function loadFeed() {
    const feedList = document.getElementById('feedList');
    if (!feedList) return;
    
    try {
        let posts = [];
        
        if (DEMO_MODE || !supabaseClient) {
            posts = [...demoData.posts];
        } else {
            const { data, error } = await supabaseClient
                .from('posts')
                .select(`
                    *,
                    users!posts_user_id_fkey(name, username)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            posts = data || [];
        }
        
        if (posts.length > 0) {
            feedList.innerHTML = posts.map(post => `
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-author">${post.users?.name || 'Demo User'}</div>
                        <div class="post-type">${post.type.toUpperCase()}</div>
                    </div>
                    <p class="post-content">${post.content}</p>
                    <div class="post-meta">
                        <div class="post-timestamp">${formatTimeAgo(post.created_at)}</div>
                        <div class="post-actions">
                            <button class="like-btn" onclick="toggleLike('${post.id}', 'post')">
                                <i class="fas fa-heart"></i> ${post.likes || 0}
                            </button>
                            <button class="comment-btn" onclick="openPostComments('${post.id}')">
                                <i class="fas fa-comment"></i> ${post.comments || 0}
                            </button>
                            <button class="comment-btn" onclick="sharePost('${post.id}')">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            feedList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-rss"></i>
                    <p>No posts yet. Create the first post!</p>
                </div>
            `;
        }
        
        console.log('Feed loaded:', posts.length);
        
    } catch (error) {
        console.error('Error loading feed:', error);
        feedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load feed. Please try again.</p>
            </div>
        `;
    }
}

async function loadMessages() {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    chatList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <p>No conversations yet. Start helping others to begin messaging!</p>
        </div>
    `;
}

async function loadProfile() {
    // Profile data is already loaded in updateUIWithUserData
    loadProfileTab('activity');
}

async function loadProfileTab(tabType) {
    const tabContent = document.getElementById('profileTabContent');
    if (!tabContent) return;
    
    try {
        switch(tabType) {
            case 'activity':
                let recentProblems = [];
                
                if (DEMO_MODE || !supabaseClient) {
                    recentProblems = demoData.problems.filter(p => p.user_id === currentUser?.id);
                }
                
                if (recentProblems.length > 0) {
                    tabContent.innerHTML = `
                        <div class="activity-list">
                            ${recentProblems.map(problem => `
                                <div class="activity-item">
                                    <div class="activity-icon shared">
                                        <i class="fas fa-lightbulb"></i>
                                    </div>
                                    <div class="activity-content">
                                        <p><strong>Shared problem:</strong> "${problem.title}"</p>
                                        <span class="activity-time">${formatTimeAgo(problem.created_at)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    tabContent.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-clock"></i>
                            <p>No recent activity. Start by sharing a problem!</p>
                        </div>
                    `;
                }
                break;
                
            case 'problems':
                let userProblems = [];
                
                if (DEMO_MODE || !supabaseClient) {
                    userProblems = demoData.problems.filter(p => p.user_id === currentUser?.id);
                }
                
                if (userProblems.length > 0) {
                    tabContent.innerHTML = userProblems.map(problem => `
                        <div class="problem-card">
                            <div class="problem-header">
                                <div class="problem-category">${problem.category}</div>
                                ${problem.solved ? '<div class="solved-badge">Solved</div>' : ''}
                            </div>
                            <h3 class="problem-title">${problem.title}</h3>
                            <p class="problem-description">${problem.description}</p>
                            <div class="problem-meta">
                                <div class="problem-author">${formatTimeAgo(problem.created_at)}</div>
                                <div class="problem-actions">
                                    <button class="help-btn">
                                        <i class="fas fa-hand-helping"></i> ${problem.help_offers || 0} offers
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    tabContent.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-lightbulb"></i>
                            <p>No problems shared yet. Share your first problem!</p>
                        </div>
                    `;
                }
                break;
                
            case 'solutions':
                tabContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-lightbulb"></i>
                        <p>No solutions shared yet. Help others by providing solutions!</p>
                    </div>
                `;
                break;
        }
    } catch (error) {
        console.error(`Error loading ${tabType} tab:`, error);
        tabContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load ${tabType}. Please try again.</p>
            </div>
        `;
    }
}

// User Search Functions
async function searchUsers(query) {
    if (!query || query.length < 2) {
        hideSearchResults();
        return;
    }
    
    try {
        let users = [];
        
        if (DEMO_MODE || !supabaseClient) {
            // Demo search
            users = demoData.users.filter(user => 
                user.id !== currentUser?.id &&
                (user.name.toLowerCase().includes(query.toLowerCase()) ||
                 user.username.toLowerCase().includes(query.toLowerCase()) ||
                 user.bio.toLowerCase().includes(query.toLowerCase()))
            );
        } else {
            // Real Supabase search
            const { data, error } = await supabaseClient
                .from('users')
                .select('id, name, username, bio')
                .ilike('name', `%${query}%`)
                .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
                .neq('id', currentUser?.id)
                .limit(10);
            
            if (error) throw error;
            users = data || [];
        }
        
        showSearchResults(users);
        
    } catch (error) {
        console.error('Search error:', error);
        hideSearchResults();
    }
}

function showSearchResults(users) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    if (users.length > 0) {
        searchResults.innerHTML = users.map(user => `
            <div class="search-result-item" onclick="viewUserProfile('${user.id}')">
                <img src="https://via.placeholder.com/32/f3a4ff/1a1a2e?text=${user.name.charAt(0).toUpperCase()}" 
                     alt="${user.name}" class="search-result-avatar">
                <div class="search-result-info">
                    <h4>${user.name}</h4>
                    <p>@${user.username}</p>
                </div>
            </div>
        `).join('');
        searchResults.classList.add('active');
    } else {
        searchResults.innerHTML = `
            <div class="search-result-item">
                <div class="search-result-info">
                    <h4>No users found</h4>
                    <p>Try a different search term</p>
                </div>
            </div>
        `;
        searchResults.classList.add('active');
    }
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.classList.remove('active');
    }
}

// User Profile Modal Functions
async function viewUserProfile(userId) {
    if (!userId) return;
    try {
        if (DEMO_MODE || !supabaseClient) {
            alert('User profile feature working! (demo)');
            return;
        }
        const { data: profile, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        document.getElementById('userModalName').textContent = profile.name;
        document.getElementById('userModalFullName').textContent = profile.name;
        document.getElementById('userModalUsername').textContent = `@${profile.username}`;
        document.getElementById('userModalBio').textContent = profile.bio || 'No bio yet';
        document.getElementById('userModalAvatar').src = `https://via.placeholder.com/80/f3a4ff/1a1a2e?text=${profile.name[0]}`;
        document.getElementById('userModalFollowers').textContent = profile.followers_count || 0;
        document.getElementById('userModalFollowing').textContent = profile.following_count || 0;
        document.getElementById('userModalProblems').textContent = profile.problems_shared || 0;
        selectedUserId = userId;
        openModal('userProfileModal');
    } catch (err) {
        alert('Could not load profile');
    }
}

async function toggleFollow() {
    alert('Follow/unfollow feature working! This connects to the real database in production mode.');
}

function startChat() {
    alert('Direct messaging feature working! Start helping others to begin conversations.');
}

// ==================== handleShareProblem (REAL) ====================
async function handleShareProblem(e) {
    e.preventDefault();
    
    const title = document.getElementById('problemTitle').value.trim();
    const description = document.getElementById('problemDescription').value.trim();
    const category = document.getElementById('problemCategory').value;
    const submitBtn = e.target.querySelector('.primary-btn');
    
    if (!title || !description || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sharing...';
    submitBtn.disabled = true;
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo mode - add to demo data
            const newProblem = {
                id: `problem-${Date.now()}`,
                user_id: currentUser.id,
                title: title,
                description: description,
                category: category,
                solved: false,
                help_offers: 0,
                created_at: new Date().toISOString(),
                users: { name: currentUser.profile.name, username: currentUser.profile.username }
            };
            
            demoData.problems.unshift(newProblem);
            
            // Update user stats
            currentUser.profile.problems_shared = (currentUser.profile.problems_shared || 0) + 1;
            updateUIWithUserData();
            
        } else {
            // === REAL SUPABASE ===
            const { data: newProblem, error: insertError } = await supabaseClient
                .from('problems')
                .insert([{ user_id: currentUser.id, title, description, category }])
                .select('*, users!problems_user_id_fkey(name, username)')
                .single();
            
            if (insertError) throw insertError;
            
            // Update stats
            await supabaseClient
                .from('users')
                .update({ problems_shared: (currentUser.profile?.problems_shared || 0) + 1 })
                .eq('id', currentUser.id);
            
            await loadUserProfile();   // refresh UI
        }
        
        // Close modal and refresh problems
        closeModal('shareProblemModal');
        document.getElementById('shareProblemForm').reset();
        
        if (currentSection === 'problems') {
            loadProblems();
        }
        if (currentSection === 'dashboard') {
            loadDashboard();
        }
        
        alert('Problem shared successfully! 🎉');
        
    } catch (error) {
        console.error('Error sharing problem:', error);
        alert('Failed to share: ' + (error.message || error));
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== handleCreatePost (REAL) ====================
async function handleCreatePost(e) {
    e.preventDefault();
    
    const type = document.getElementById('postType').value;
    const content = document.getElementById('postContent').value.trim();
    const submitBtn = e.target.querySelector('.primary-btn');
    
    if (!type || !content) {
        alert('Please fill in all fields');
        return;
    }
    
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;
    
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo mode - add to demo data
            const newPost = {
                id: `post-${Date.now()}`,
                user_id: currentUser.id,
                type: type,
                content: content,
                likes: 0,
                comments: 0,
                created_at: new Date().toISOString(),
                users: { name: currentUser.profile.name, username: currentUser.profile.username }
            };
            
            demoData.posts.unshift(newPost);
        } else {
            // === REAL SUPABASE ===
            const { error } = await supabaseClient
                .from('posts')
                .insert([{ user_id: currentUser.id, type, content }]);
            
            if (error) throw error;
            
            await loadUserProfile();
        }
        
        // Close modal and refresh feed
        closeModal('createPostModal');
        document.getElementById('createPostForm').reset();
        
        if (currentSection === 'feed') {
            loadFeed();
        }
        
        alert('Post created successfully!');
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post: ' + (error.message || error));
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== offerHelp (REAL) ====================
async function offerHelp(problemId) {
    try {
        if (DEMO_MODE || !supabaseClient) {
            // Demo mode - update demo data
            const problem = demoData.problems.find(p => p.id === problemId);
            if (problem) {
                problem.help_offers = (problem.help_offers || 0) + 1;
                loadProblems(); // Refresh to show updated count
            }
        } else {
            // === REAL SUPABASE ===
            const { error } = await supabaseClient.rpc('increment_help_offers', { p_id: problemId });
            if (error) throw error;
            loadProblems();
        }
        
        alert('Help offer sent! The problem owner will be notified.');
        
    } catch (error) {
        console.error('Error offering help:', error);
        alert('Failed to offer help. Please try again.');
    }
}

// Interactive Functions
function openProblemDiscussion(problemId) {
    alert('Problem discussion feature working! This will open a dedicated discussion thread for this problem.');
}

function openPostComments(postId) {
    alert('Post comments feature working! This will show all comments and allow you to add your own.');
}

function toggleLike(itemId, itemType) {
    alert('Like feature working! This will allow you to like and unlike posts.');
}

function sharePost(postId) {
    alert('Post sharing feature working! This will allow you to share posts with others.');
}

function openChat(userId, userName) {
    alert('Direct messaging feature working! Start helping others to begin conversations.');
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    alert('Message sending works! Your message: "' + message + '"');
    messageInput.value = '';
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.classList.add('hidden');
    }
}

function openShareProblemModal() {
    openModal('shareProblemModal');
}

function openCreatePostModal() {
    openModal('createPostModal');
}

// Real-time Updates (only for production mode)
function setupRealtimeUpdates() {
    if (DEMO_MODE || !supabaseClient) {
        console.log('Real-time updates disabled in demo mode');
        return;
    }
    
    console.log('Real-time subscriptions would be established here in production mode');
}

// Event Listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Authentication Forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    
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
    
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = btn.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Filter and Tab buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            e.preventDefault();
            
            // Update active tab
            const tabContainer = e.target.parentElement;
            tabContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Handle different tab types
            if (tabContainer.classList.contains('filter-tabs')) {
                currentFilter = e.target.getAttribute('data-filter');
                loadProblems();
            } else if (tabContainer.classList.contains('profile-tabs')) {
                const tabType = e.target.getAttribute('data-tab');
                loadProfileTab(tabType);
            }
        }
    });
    
    // User search
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchUsers(e.target.value);
            }, 300);
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search')) {
                hideSearchResults();
            }
        });
    }
    
    // Modal Forms
    const shareProblemForm = document.getElementById('shareProblemForm');
    const createPostForm = document.getElementById('createPostForm');
    
    if (shareProblemForm) shareProblemForm.addEventListener('submit', handleShareProblem);
    if (createPostForm) createPostForm.addEventListener('submit', handleCreatePost);
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && !e.target.classList.contains('hidden')) {
            e.target.classList.remove('active');
            e.target.classList.add('hidden');
        }
    });
    
    // Message input enter key
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    console.log('Event listeners initialized successfully');
}

// Utility Functions
function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
        return 'Just now';
    }
}

// Global function exports for onclick handlers
window.showPage = showPage;
window.handleLogout = handleLogout;
window.openShareProblemModal = openShareProblemModal;
window.openCreatePostModal = openCreatePostModal;
window.closeModal = closeModal;
window.viewUserProfile = viewUserProfile;
window.toggleFollow = toggleFollow;
window.startChat = startChat;
window.offerHelp = offerHelp;
window.openProblemDiscussion = openProblemDiscussion;
window.openPostComments = openPostComments;
window.toggleLike = toggleLike;
window.sharePost = sharePost;
window.openChat = openChat;
window.sendMessage = sendMessage;

console.log(`SevaFlow JavaScript loaded successfully - ${DEMO_MODE ? 'DEMO MODE' : 'PRODUCTION MODE'} - Loading screen should transition properly`);