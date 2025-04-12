const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://www.staff-score.com';

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();

    document.querySelectorAll('.survey-question button').forEach(button => {
        button.addEventListener('click', function() {
            const questionDiv = this.closest('.survey-question');
            questionDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            questionDiv.dataset.score = this.dataset.value;
            updateOverallScore();
        });
    });
});

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateHeaderForLoggedInUser(user);
    }
}

function updateHeaderForLoggedInUser(user) {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    headerRight.innerHTML = '';
    const userDiv = document.createElement('div');
    userDiv.className = 'user-profile';
    userDiv.innerHTML = `
        <div class="profile-container">
            <img src="${user.imageUrl || '/images/default-avatar.png'}" alt="Profile" class="user-avatar">
            <span class="user-name">${user.name}</span>
            <span class="dropdown-arrow">▼</span>
        </div>
        <div class="user-dropdown">
            <a href="${user.userType === 'company' ? 'company-dashboard.html' : 'employee-dashboard.html'}">Dashboard</a>
            <a href="profile.html">My Profile</a>
            <a href="#" onclick="signOut(); return false;">Sign Out</a>
        </div>
    `;
    headerRight.appendChild(userDiv);

    userDiv.addEventListener('click', function(e) {
        if (window.innerWidth < 768) {
            const dropdown = this.querySelector('.user-dropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            e.stopPropagation();
        }
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth < 768 && !userDiv.contains(e.target)) {
            const dropdown = userDiv.querySelector('.user-dropdown');
            if (dropdown) dropdown.style.display = 'none';
        }
    });
}

function updateOverallScore() {
    const questions = document.querySelectorAll('.survey-question');
    let total = 0;
    questions.forEach(question => {
        total += parseFloat(question.dataset.score) || 0;
    });
    const average = (total / questions.length).toFixed(1);
    document.getElementById('staff-score').value = average;
}

if (document.getElementById('review-form')) {
    document.getElementById('review-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = {
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            company: document.getElementById('company').value.trim(),
            position: document.getElementById('position').value.trim(),
        };
        const ratings = Array.from(document.querySelectorAll('.survey-question')).map(question => ({
            score: parseFloat(question.dataset.score) || 0
        }));
        const reviewData = {
            ...formData,
            employeeName: `${formData.firstName} ${formData.lastName}`,
            reliabilityRating: ratings[0].score,
            accountabilityRating: ratings[1].score,
            teamworkRating: ratings[2].score,
            adaptabilityRating: ratings[3].score,
            problemSolvingRating: ratings[4].score,
            workQualityRating: ratings[5].score,
            workEthicRating: ratings[6].score,
            timeManagementRating: ratings[7].score,
            professionalismRating: ratings[8].score,
            initiativeRating: ratings[9].score
        };
        try {
            const response = await fetch(`${baseUrl}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Review submitted successfully!');
                window.location.href = 'thank-you.html';
            } else {
                alert('Failed to submit review: ' + result.error);
            }
        } catch (error) {
            console.error("Error during submission:", error);
            alert('An error occurred: ' + error.message);
        }
    });
}

document.querySelectorAll('.star-rating').forEach(ratingContainer => {
    const stars = ratingContainer.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            stars.forEach(s => s.classList.remove('selected'));
            const value = parseInt(star.dataset.value);
            stars.forEach(s => {
                if (parseInt(s.dataset.value) <= value) {
                    s.classList.add('selected');
                }
            });
            console.log(`Selected rating for ${ratingContainer.id}:`, value);
        });
    });
});

function searchByCompany() {
    const companyName = document.getElementById('company').value.trim().toLowerCase();
    if (!companyName) return alert('Please enter a company name.');
    fetch(`${baseUrl}/api/reviews/reviews/company/${companyName}`)
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch reviews.'))
        .then(data => {
            if (!data.length) return alert('No reviews found for this company.');
            localStorage.setItem('reviews', JSON.stringify(data));
            window.location.href = 'results.html';
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            alert('An error occurred while fetching reviews.');
        });
}

function searchByName() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    if (!firstName && !lastName) return alert('Please enter at least a first or last name.');
    const queryParams = new URLSearchParams();
    if (firstName) queryParams.append('firstName', firstName);
    if (lastName) queryParams.append('lastName', lastName);
    fetch(`${baseUrl}/api/reviews/reviews/name?${queryParams.toString()}`)
        .then(response => response.ok ? response.json() : Promise.reject('No reviews found'))
        .then(data => {
            if (!data.length) return alert('No reviews found for this person.');
            localStorage.setItem('reviews', JSON.stringify(data));
            window.location.href = 'results.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No reviews found or an error occurred.');
        });
}

function signOut() {
    localStorage.removeItem('user');
    alert('You have been signed out.');
    window.location.href = 'index.html';
}

if (document.getElementById('email-signup-form')) {
    document.getElementById('email-signup-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Default role is 'employee' - you might want to add a selector for this
        const role = 'employee';
        
        const signupData = {
            firstName,
            lastName,
            email,
            password,
            role
        };
        
        try {
            const response = await fetch(`${baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard based on user type
                alert('Signup successful!');
                window.location.href = data.user.userType === 'company' ? 'company-dashboard.html' : 'employee-dashboard.html';
            } else {
                alert('Signup failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('An error occurred during signup: ' + error.message);
        }
    });
}