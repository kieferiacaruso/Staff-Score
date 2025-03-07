// Define the base URL for API requests
const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://www.staff-score.com'; // Replace with your Heroku or custom domain URL

// Existing form submission handler
document.addEventListener('DOMContentLoaded', () => {
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
        const response = await fetch(`${baseUrl}/api/reviews`, { // Use baseUrl
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });

        const result = await response.json();
        console.log("Response from server:", result); // Log the response

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

// Function to get the star rating from the UI
function getStarRating(starId) {
    const stars = document.querySelectorAll(`#${starId} .star`);
    let selectedRating = 0;
    stars.forEach(star => {
        if (star.classList.contains('selected')) {
            selectedRating = parseInt(star.getAttribute('data-value'));
        }
    });
    console.log(`Selected rating for ${starId}:`, selectedRating);
    return selectedRating;
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

            console.log(`Selected rating for ${ratingContainer.id}:`, value);  // Log the selected value
        });
    });
});

function searchByCompany() {
    const companyName = document.getElementById('company').value.trim().toLowerCase();
    if (!companyName) {
        alert('Please enter a company name.');
        return;
    }

    fetch(`${baseUrl}/api/reviews/reviews/company/${companyName}`) // Use baseUrl
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

            // Store the reviews in localStorage for results.html to access
            localStorage.setItem('reviews', JSON.stringify(data));

            // Redirect to results.html
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

    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (firstName) queryParams.append('firstName', firstName);
    if (lastName) queryParams.append('lastName', lastName);
    
    // Fetch matching reviews
    fetch(`${baseUrl}/api/reviews/reviews/name?${queryParams.toString()}`) // Use baseUrl
        .then(response => {
            if (!response.ok) throw new Error('No reviews found');
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                alert('No reviews found for this company.');
                return;
            }

            // Store the reviews in localStorage for results-name.html to access
            localStorage.setItem('reviews', JSON.stringify(data));

            // Redirect to results.html
            window.location.href = 'results.html';
            
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No reviews found or an error occurred.');
        });
}
function onSignIn(googleUser) {
    try {
        var profile = googleUser.getBasicProfile();
        var idToken = googleUser.getAuthResponse().id_token;

        console.log("Sign-in successful, processing user data");
        
        // Prepare profile data
        const profileData = {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
            idToken: idToken
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
                
                // Redirect based on the current page
                const currentPage = window.location.pathname;
                if (currentPage.includes('company')) {
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
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        // Clear any stored tokens or user data
        localStorage.removeItem('token');
        alert('You have been signed out.');
        // Redirect to the login page or homepage
        window.location.href = 'login.html';
    });
}