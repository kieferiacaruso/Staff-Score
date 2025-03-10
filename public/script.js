// Define the base URL for API requests
const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://www.staff-score.com'; // Replace with your Heroku or custom domain URL

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    // Set up survey question listeners if they exist on the page
    document.querySelectorAll('.survey-question button').forEach(button => {
        button.addEventListener('click', function() {
            const questionDiv = this.closest('.survey-question');
            // Remove existing selections
            questionDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            // Add selection
            this.classList.add('selected');
            // Update score
            questionDiv.dataset.score = this.dataset.value;
            updateOverallScore();
        });
    });
});

// Check if the user is logged in and update UI accordingly
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // User is logged in, update the header
        updateHeaderForLoggedInUser(user);
    }
}

// Update the header for a logged-in user
function updateHeaderForLoggedInUser(user) {
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        // Clear existing buttons
        headerRight.innerHTML = '';
        
        // Add user info and dropdown
        const userDiv = document.createElement('div');
        userDiv.className = 'user-profile';
        userDiv.innerHTML = `
            <span class="user-name">${user.name}</span>
            <img src="${user.imageUrl || '/images/default-avatar.png'}" alt="Profile" class="user-avatar">
            <div class="user-dropdown">
                <a href="${user.userType === 'company' ? 'company-dashboard.html' : 'employee-dashboard.html'}">Dashboard</a>
                <a href="#" onclick="signOut(); return false;">Sign Out</a>
            </div>
        `;
        headerRight.appendChild(userDiv);
        
        // Add CSS for the user profile section
        const style = document.createElement('style');
        style.textContent = `
            .user-profile {
                display: flex;
                align-items: center;
                position: relative;
                cursor: pointer;
            }
            .user-name {
                margin-right: 10px;
            }
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
            }
            .user-dropdown {
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 100;
                min-width: 150px;
            }
            .user-dropdown a {
                display: block;
                padding: 10px 15px;
                text-decoration: none;
                color: #333;
            }
            .user-dropdown a:hover {
                background: #f5f5f5;
            }
            .user-profile:hover .user-dropdown {
                display: block;
            }
        `;
        document.head.appendChild(style);
    }
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

// Updated form submission handler
if (document.getElementById('review-form')) {
    document.getElementById('review-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        // Collect form data
        const formData = {
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            company: document.getElementById('company').value.trim(),
            position: document.getElementById('position').value.trim(),
        };

        // Collect ratings in order of questions
        const ratings = Array.from(document.querySelectorAll('.survey-question')).map(question => ({
            score: parseFloat(question.dataset.score) || 0
        }));

        // Map ratings to specific fields
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

        // Send the data to the server
        try {
            const response = await fetch(`${baseUrl}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData),
            });

            const result = await response.json();
            console.log("Response from server:", result);

            if (response.ok) {
                alert('Review submitted successfully!');
                // Redirect to thank-you.html
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

// Handle star rating interaction
document.querySelectorAll('.star-rating').forEach(ratingContainer => {
    const stars = ratingContainer.querySelectorAll('.star');
  
    stars.forEach(star => {
        star.addEventListener('click', () => {
            // Clear previous selections
            stars.forEach(s => s.classList.remove('selected'));
  
            // Highlight selected stars and those before it
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

// Search functions
function searchByCompany() {
    const companyName = document.getElementById('company').value.trim().toLowerCase();
    if (!companyName) {
        alert('Please enter a company name.');
        return;
    }

    fetch(`${baseUrl}/api/reviews/reviews/company/${companyName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch reviews.');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                alert('No reviews found for this company.');
                return;
            }

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

    if (!firstName && !lastName) {
        alert('Please enter at least a first or last name.');
        return;
    }

    const queryParams = new URLSearchParams();
    if (firstName) queryParams.append('firstName', firstName);
    if (lastName) queryParams.append('lastName', lastName);
    
    fetch(`${baseUrl}/api/reviews/reviews/name?${queryParams.toString()}`)
        .then(response => {
            if (!response.ok) throw new Error('No reviews found');
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                alert('No reviews found for this person.');
                return;
            }

            localStorage.setItem('reviews', JSON.stringify(data));
            window.location.href = 'results.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No reviews found or an error occurred.');
        });
}

// Google Sign-In callback function
function onSignIn(googleUser) {
    try {
        var profile = googleUser.getBasicProfile();
        var idToken = googleUser.getAuthResponse().id_token;

        console.log("Sign-in successful, processing user data");
        
        // Determine user type based on current page
        const currentPage = window.location.pathname;
        const userType = currentPage.includes('company') ? 'company' : 'employee';
        
        // Prepare profile data
        const profileData = {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
            idToken: idToken,
            userType: userType // Add the userType field required by your model
        };
        
        // Send token and profile data to your backend
        fetch(`${baseUrl}/api/auth/google-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                idToken: idToken,
                profile: profileData
            }),
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log("User authenticated successfully");
                // Store user session
                localStorage.setItem("user", JSON.stringify(data.user));
                
                // Update UI to show logged in state
                updateHeaderForLoggedInUser(data.user);
                
                // Redirect based on the current page
                if (userType === 'company') {
                    window.location.href = "company-dashboard.html";
                } else {
                    window.location.href = "employee-dashboard.html";
                }
            } else {
                console.error("Authentication failed:", data.message);
                alert("Login failed: " + (data.message || "Unknown error"));
            }
        })
        .catch(error => {
            console.error("Error during authentication:", error);
            alert("An error occurred during login. Please try again later.");
        });
    } catch (e) {
        console.error("Error in onSignIn function:", e);
        alert("There was a problem with Google Sign-In. Please try again.");
    }
}

// Sign-out function
function signOut() {
    // Check if gapi is loaded
    if (typeof gapi !== 'undefined' && gapi.auth2) {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User signed out from Google.');
            completeSignOut();
        });
    } else {
        // If gapi is not available, just clear local storage
        completeSignOut();
    }
}

// Complete the sign-out process
function completeSignOut() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Display signed out message
    alert('You have been signed out.');
    
    // Refresh the page to update UI or redirect to home
    window.location.href = 'index.html';
}