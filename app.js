// Check if we're on the dashboard page
if (window.location.pathname.includes('dashboard.html')) {
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // If not logged in, redirect to login
            window.location.href = 'index.html';
        } else {
            // Load user data
            loadUserData(user);
            initializeApp(user);
        }
    });

    // DOM Elements
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const welcomeName = document.getElementById('welcomeName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Timer elements
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimer = document.getElementById('startTimer');
    const pauseTimer = document.getElementById('pauseTimer');
    const resetTimer = document.getElementById('resetTimer');
    const timerModes = document.querySelectorAll('.timer-mode');
    const saveSession = document.getElementById('saveSession');
    const sessionNotes = document.getElementById('sessionNotes');
    
    // Chat elements
    const sendChat = document.getElementById('sendChat');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    // Schedule elements
    const addTask = document.getElementById('addTask');
    const newTask = document.getElementById('newTask');
    const taskTime = document.getElementById('taskTime');
    const scheduleList = document.getElementById('scheduleList');
    
    // Community elements
    const postQuestion = document.getElementById('postQuestion');
    const newPost = document.getElementById('newPost');
    const communityPosts = document.getElementById('communityPosts');

    // Timer variables
    let timerInterval;
    let timerSeconds = 25 * 60;
    let isTimerRunning = false;
    let currentUser = null;

    // Initialize app
    function initializeApp(user) {
        currentUser = user;
        updateTimerDisplay();
        loadStudySessions();
        loadSchedule();
        loadCommunityPosts();
        initializeChart();
    }

    // Load user data
    function loadUserData(user) {
        userName.textContent = user.displayName || 'Student';
        welcomeName.textContent = user.displayName || 'Student';
        userAvatar.src = user.photoURL || 'https://via.placeholder.com/40';
    }

    // Timer functions
    function updateTimerDisplay() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimerFunction() {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    alert('🎉 Timer completed! Great job!');
                    
                    // Auto-save session
                    if (sessionNotes.value) {
                        saveStudySession();
                    }
                }
            }, 1000);
        }
    }

    function pauseTimerFunction() {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    function resetTimerFunction() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerSeconds = 25 * 60;
        updateTimerDisplay();
    }

    // Save study session
    async function saveStudySession() {
        if (!currentUser) return;
        
        const note = sessionNotes.value.trim() || 'Unnamed session';
        const duration = (25 * 60 - timerSeconds) / 60; // minutes studied
        
        if (duration < 1) {
            alert('Session too short to save (minimum 1 minute)');
            return;
        }
        
        try {
            await db.collection('studySessions').add({
                userId: currentUser.uid,
                userName: currentUser.displayName,
                duration: duration,
                note: note,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update user's total study time
            const userRef = db.collection('users').doc(currentUser.uid);
            await userRef.update({
                totalStudyTime: firebase.firestore.FieldValue.increment(duration)
            });
            
            // Update today's study stats
            updateTodayStats();
            
            sessionNotes.value = '';
            alert('✅ Session saved successfully!');
            
            // Reset timer
            resetTimerFunction();
            
            // Refresh chart
            updateChart();
        } catch (error) {
            console.error('Error saving session:', error);
            alert('Failed to save session');
        }
    }

    // Load study sessions and update stats
    async function loadStudySessions() {
        if (!currentUser) return;
        
        try {
            const sessions = await db.collection('studySessions')
                .where('userId', '==', currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            let totalMinutes = 0;
            sessions.forEach(doc => {
                totalMinutes += doc.data().duration || 0;
            });
            
            document.getElementById('totalHours').textContent = `${Math.round(totalMinutes / 60)} hrs`;
            
            // Update today's stats
            await updateTodayStats();
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }

    // Update today's stats
    async function updateTodayStats() {
        if (!currentUser) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        try {
            const sessions = await db.collection('studySessions')
                .where('userId', '==', currentUser.uid)
                .where('timestamp', '>=', today)
                .get();
            
            let todayMinutes = 0;
            sessions.forEach(doc => {
                todayMinutes += doc.data().duration || 0;
            });
            
            document.getElementById('todayStudy').textContent = `${Math.round(todayMinutes)} min`;
            
            // Update streak
            if (todayMinutes > 0) {
                document.getElementById('currentStreak').textContent = '1 day';
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Schedule functions
    async function loadSchedule() {
        if (!currentUser) return;
        
        try {
            const today = new Date().toDateString();
            const tasks = await db.collection('tasks')
                .where('userId', '==', currentUser.uid)
                .where('date', '==', today)
                .get();
            
            scheduleList.innerHTML = '';
            tasks.forEach(doc => {
                const task = doc.data();
                addTaskToUI(task.time, task.task, doc.id);
            });
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    function addTaskToUI(time, task, taskId) {
        const taskItem = document.createElement('div');
        taskItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded-lg';
        taskItem.innerHTML = `
            <div>
                <span class="font-medium text-purple-600">${time}</span> - ${task}
            </div>
            <button class="text-red-500 hover:text-red-700 delete-task" data-id="${taskId}">
                <i class="fas fa-times"></i>
            </button>
        `;
        scheduleList.appendChild(taskItem);
    }

    // Add new task
    addTask.addEventListener('click', async () => {
        if (!currentUser) {
            alert('Please login to add tasks');
            return;
        }
        
        const task = newTask.value.trim();
        const time = taskTime.value;
        
        if (!task || !time) {
            alert('Please enter both task and time');
            return;
        }
        
        try {
            const today = new Date().toDateString();
            const docRef = await db.collection('tasks').add({
                userId: currentUser.uid,
                task: task,
                time: time,
                date: today,
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            addTaskToUI(time, task, docRef.id);
            
            newTask.value = '';
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task');
        }
    });

    // Delete task (event delegation)
    scheduleList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-task')) {
            const button = e.target.closest('.delete-task');
            const taskId = button.dataset.id;
            
            try {
                await db.collection('tasks').doc(taskId).delete();
                button.closest('.flex').remove();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            }
        }
    });

    // Community functions
    async function loadCommunityPosts() {
        try {
            const posts = await db.collection('communityPosts')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            communityPosts.innerHTML = '';
            
            if (posts.empty) {
                communityPosts.innerHTML = '<p class="text-gray-500 text-center">No posts yet. Be the first to ask!</p>';
                return;
            }
            
            posts.forEach(doc => {
                const post = doc.data();
                const postEl = document.createElement('div');
                postEl.className = 'p-3 border rounded-lg';
                postEl.innerHTML = `
                    <div class="flex items-center space-x-2 mb-2">
                        <img src="${post.userPhoto || 'https://via.placeholder.com/30'}" class="w-6 h-6 rounded-full">
                        <span class="font-medium text-sm">${post.userName || 'Anonymous'}</span>
                        <span class="text-gray-400 text-xs">${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Just now'}</span>
                    </div>
                    <p class="text-sm">${post.content}</p>
                    <div class="flex space-x-4 mt-2 text-xs text-gray-500">
                        <button class="hover:text-purple-600"><i class="far fa-heart"></i> ${post.likes || 0}</button>
                        <button class="hover:text-purple-600"><i class="far fa-comment"></i> Reply</button>
                    </div>
                `;
                communityPosts.appendChild(postEl);
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    // Post question
    postQuestion.addEventListener('click', async () => {
        if (!currentUser) {
            alert('Please login to post');
            return;
        }
        
        const content = newPost.value.trim();
        if (!content) return;
        
        try {
            await db.collection('communityPosts').add({
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhoto: currentUser.photoURL || 'https://via.placeholder.com/30',
                content: content,
                likes: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            newPost.value = '';
            loadCommunityPosts();
        } catch (error) {
            console.error('Error posting:', error);
            alert('Failed to post. Please try again.');
        }
    });

    // AI Chat
    sendChat.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'bg-blue-100 p-3 rounded-lg text-right';
        userMsg.innerHTML = `<strong>You:</strong> ${message}`;
        chatMessages.appendChild(userMsg);
        
        // Mock AI response (you can replace with actual AI API)
        setTimeout(() => {
            let response = "I'm here to help! ";
            
            if (message.toLowerCase().includes('math')) {
                response += "For math problems, try breaking them down into smaller steps. What specific topic are you studying?";
            } else if (message.toLowerCase().includes('physics')) {
                response += "Physics is all about understanding concepts. Would you like me to explain a specific principle?";
            } else if (message.toLowerCase().includes('bored')) {
                response += "Take a short break! Remember why you started studying. You've got this! 💪";
            } else {
                response += "That's a great question. Let me think about it... Could you provide more details?";
            }
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'bg-purple-100 p-3 rounded-lg';
            aiMsg.innerHTML = `<strong>AI:</strong> ${response}`;
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Chart initialization
    let studyChart;
    
    function initializeChart() {
        const ctx = document.getElementById('studyChart').getContext('2d');
        studyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Study Hours',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
        
        updateChart();
    }

    async function updateChart() {
        if (!currentUser || !studyChart) return;
        
        try {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            
            const sessions = await db.collection('studySessions')
                .where('userId', '==', currentUser.uid)
                .where('timestamp', '>=', lastWeek)
                .get();
            
            const dailyHours = [0, 0, 0, 0, 0, 0, 0];
            
            sessions.forEach(doc => {
                const session = doc.data();
                if (session.timestamp) {
                    const date = session.timestamp.toDate();
                    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    // Convert to Monday=0, Sunday=6
                    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    dailyHours[adjustedDay] += (session.duration || 0) / 60; // Convert to hours
                }
            });
            
            studyChart.data.datasets[0].data = dailyHours;
            studyChart.update();
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    // Event Listeners
    startTimer.addEventListener('click', startTimerFunction);
    pauseTimer.addEventListener('click', pauseTimerFunction);
    resetTimer.addEventListener('click', resetTimerFunction);
    
    timerModes.forEach(mode => {
        mode.addEventListener('click', function() {
            timerModes.forEach(m => {
                m.classList.remove('bg-purple-100', 'text-purple-600');
                m.classList.add('bg-gray-100', 'text-gray-600');
            });
            this.classList.remove('bg-gray-100', 'text-gray-600');
            this.classList.add('bg-purple-100', 'text-purple-600');
            
            timerSeconds = parseInt(this.dataset.time) * 60;
            updateTimerDisplay();
        });
    });
    
    saveSession.addEventListener('click', saveStudySession);
    
    // Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Enter key for chat
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChat.click();
        }
    });

    // Enter key for posting
    newPost.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postQuestion.click();
        }
    });
}
