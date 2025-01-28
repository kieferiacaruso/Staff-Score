// Define the base URL for API requests
const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://staff-score-1d60849dcb26.herokuapp.com'; // Replace with your Heroku or custom domain URL

// Existing form submission handler
document.getElementById('review-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get the values from the form
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const employeeName = `${firstName} ${lastName}`; // Combine names
    const company = document.getElementById('company').value;
    const position = document.getElementById('position').value;
    const reason = document.getElementById('reason').value;

    // Get the ratings from the star elements
    const overallRating = getStarRating('overall-score');
    const communicationRating = getStarRating('communication-rating');
    const teamworkRating = getStarRating('teamwork-rating');
    const technicalSkillsRating = getStarRating('technical-skills-rating');

    // Create the review object
    const newReview = {
        firstName,
        lastName,
        employeeName,
        company,
        position,
        reason,
        communicationRating,
        teamworkRating,
        technicalSkillsRating,
        overallRating
    };

    // Send the data to the server
    try {
        const response = await fetch(`${baseUrl}/api/reviews`, { // Use baseUrl
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReview),
        });

        const result = await response.json();
        console.log("Response from server:", result); // Log the response

        if (response.ok) {
            alert('Review submitted successfully!');
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
    const companyName = document.getElementById('company').value.trim();
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
