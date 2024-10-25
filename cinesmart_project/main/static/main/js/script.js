// main/static/main/js/script.js

const apiKey = 'd8fb378b6567392adbfae7049c722249';

const baseApiUrl = 'https://api.themoviedb.org/3';
const searchMoviesUrl = `${baseApiUrl}/search/movie?api_key=${apiKey}&query=`;

const categoryUrls = {
    'popular': `${baseApiUrl}/movie/popular?api_key=${apiKey}`,
    'top_rated': `${baseApiUrl}/movie/top_rated?api_key=${apiKey}`,
    'upcoming': `${baseApiUrl}/movie/upcoming?api_key=${apiKey}`,
    // Add more categories as needed
};

let currentCategory = 'popular'; // Default category
let currentGenreId = null; // No genre selected by default


function fetchMoviesByGenre(genreId) {
    const url = `${baseApiUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}`;
    fetchMovies(url);
}

function handleGenreClicks() {
    const genreLinks = document.querySelectorAll('.genres ul li a');
    genreLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const genreId = this.getAttribute('data-genre-id');
            if (genreId) {
                currentGenreId = genreId;
                currentCategory = null; // Reset current category
                fetchMoviesByGenre(genreId);
                updateActiveGenreLink(genreId);
                updateActiveCategoryLink(null); // Remove active class from categories
                // Reset search input
                if (searchBar) {
                    searchBar.value = '';
                }
            }
        });
    });
}


function updateActiveGenreLink(selectedGenreId) {
    const genreLinks = document.querySelectorAll('.genres ul li a');
    genreLinks.forEach(link => {
        if (link.getAttribute('data-genre-id') === selectedGenreId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to fetch movies
function fetchMovies(url) {
    const moviesContainer = document.getElementById('movies');
    moviesContainer.innerHTML = '<div class="loader"></div>'; // Show loader

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            moviesContainer.innerHTML = ''; 

            if (!movies || movies.length === 0) {
                moviesContainer.innerHTML = '<p>No results found.</p>';
                return;
            }

            movies.forEach(movie => {
                // Create movie card elements
                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');
                movieCard.dataset.movieId = movie.id; // Store movie ID for later use

                const moviePoster = document.createElement('img');
                if (movie.poster_path) {
                    moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                } else {
                    moviePoster.src = '/static/main/images/no_poster_available.jpg';
                }
                moviePoster.alt = `${movie.title} Poster`;

                const movieTitle = document.createElement('h3');
                movieTitle.textContent = movie.title;

                const movieRating = document.createElement('p');
                movieRating.textContent = `Rating: ${movie.vote_average}`;

                // Append elements to movie card
                movieCard.appendChild(moviePoster);
                movieCard.appendChild(movieTitle);
                movieCard.appendChild(movieRating);

                // Append movie card to container
                moviesContainer.appendChild(movieCard);

                // Add event listener to the movie card
                movieCard.addEventListener('click', () => {
                    const movieId = movieCard.dataset.movieId;
                    fetchMovieDetails(movieId);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            moviesContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
        });
}

// Function to fetch movies by category
function fetchMoviesByCategory(category) {
    const url = categoryUrls[category];
    if (url) {
        currentGenreId = null; // Reset current genre
        fetchMovies(url);
    } else {
        console.error(`No URL found for category: ${category}`);
    }
}

// Function to fetch and display movie details in a modal
function fetchMovieDetails(movieId) {
    const movieDetailsUrl = `${baseApiUrl}/movie/${movieId}?api_key=${apiKey}&language=en-US`;

    fetch(movieDetailsUrl)
        .then(response => response.json())
        .then(movie => {
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = ''; 

            // Create elements for movie details
            const backdropPath = movie.backdrop_path || movie.poster_path;
            const movieImage = document.createElement('img');
            if (backdropPath) {
                movieImage.src = `https://image.tmdb.org/t/p/w780${backdropPath}`;
            } else {
                movieImage.src = '/static/main/images/no_poster_available.jpg';
            }
            movieImage.alt = `${movie.title} Image`;

            const movieTitle = document.createElement('h2');
            movieTitle.textContent = movie.title;

            const movieOverview = document.createElement('p');
            movieOverview.textContent = movie.overview;

            const genresContainer = document.createElement('div');
            genresContainer.classList.add('genres');
            movie.genres.forEach(genre => {
                const genreSpan = document.createElement('span');
                genreSpan.textContent = genre.name;
                genresContainer.appendChild(genreSpan);
            });

            const rating = document.createElement('p');
            rating.classList.add('rating');
            rating.textContent = `Rating: ${movie.vote_average} / 10`;

            const releaseDate = document.createElement('p');
            releaseDate.classList.add('release-date');
            releaseDate.textContent = `Release Date: ${movie.release_date}`;

            // Append elements to modal body
            modalBody.appendChild(movieImage);
            modalBody.appendChild(movieTitle);
            modalBody.appendChild(rating);
            modalBody.appendChild(releaseDate);
            modalBody.appendChild(genresContainer);
            modalBody.appendChild(movieOverview);

            // Show the modal
            const modal = document.getElementById('movie-detail-modal');
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            alert('Unable to fetch movie details. Please try again later.');
        });
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('movie-detail-modal');
    modal.style.display = 'none';
}

// Event listener for closing the modal
const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside of modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('movie-detail-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// Function to handle category clicks
function handleCategoryClicks() {
    const categoryLinks = document.querySelectorAll('.categories ul li a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            const selectedCategory = this.getAttribute('data-category');
            if (selectedCategory) {
                currentCategory = selectedCategory;
                currentGenreId = null; // Reset current genre
                fetchMoviesByCategory(currentCategory);
                updateActiveCategoryLink(selectedCategory);
                updateActiveGenreLink(null); // Remove active class from genres
                // Reset search input
                if (searchBar) {
                    searchBar.value = '';
                }
            }
        });
    });
}

// Function to update the active class on the sidebar links
function updateActiveCategoryLink(selectedCategory) {
    const categoryLinks = document.querySelectorAll('.categories ul li a');
    categoryLinks.forEach(link => {
        if (link.getAttribute('data-category') === selectedCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Authentication and other functionalities
function handleAuthModalsAndMessages() {
    const signupModal = document.getElementById('signup-modal');
    const loginModal = document.getElementById('login-modal');
    const signupBtn = document.getElementById('signup-button');
    const loginBtn = document.getElementById('login-button');
    const closeSignup = document.getElementById('close-signup');
    const closeLogin = document.getElementById('close-login');
    const goToSignup = document.getElementById('go-to-signup');
    const goToLogin = document.getElementById('go-to-login');

    // Open Signup Modal
    if (signupBtn) {
        signupBtn.onclick = function () {
            signupModal.style.display = 'block';
        };
    }

    // Open Login Modal
    if (loginBtn) {
        loginBtn.onclick = function () {
            loginModal.style.display = 'block';
        };
    }

    // Close Signup Modal
    if (closeSignup) {
        closeSignup.onclick = function () {
            signupModal.style.display = 'none';
        };
    }

    // Close Login Modal
    if (closeLogin) {
        closeLogin.onclick = function () {
            loginModal.style.display = 'none';
        };
    }

    // Switch to Signup Modal from Login Modal
    if (goToSignup) {
        goToSignup.onclick = function () {
            loginModal.style.display = 'none';
            signupModal.style.display = 'block';
        };
    }

    // Switch to Login Modal from Signup Modal
    if (goToLogin) {
        goToLogin.onclick = function () {
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
        };
    }

    // Close modals when clicking outside of them
    window.onclick = function (event) {
        if (event.target == signupModal) {
            signupModal.style.display = 'none';
        }
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    };

    // Handle search input
    const searchBar = document.getElementById('search-bar');
    const debounceDelay = 500;
    let debounceTimer;

    if (searchBar) {
        searchBar.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            const query = searchBar.value.trim();

            debounceTimer = setTimeout(() => {
                if (query) {
                    searchMovies(query);
                } else {
                    fetchPopularMovies();
                }
            }, debounceDelay);
        });
    }

    // Chatbot functionality
    const chatbotButton = document.getElementById('chatbot-button');
    if (chatbotButton) {
        chatbotButton.addEventListener('click', function() {
            const width = 300;
            const height = 600;
            const left = screen.width - width;
            const top = (screen.height / 2) - (height / 2);

            window.open(
                'https://mediafiles.botpress.cloud/7d8c96e0-f4bf-4924-9274-f6fe28185ead/webchat/bot.html', 
                'CineBot', 
                `width=${width},height=${height},top=${top},left=${left}`
            );
        });
    }

    // Handle messages and modal visibility based on authentication status
    const messages = document.querySelectorAll('.message');

    messages.forEach(function(message) {
        // Listen for the end of the fadeout animation to remove the message
        message.addEventListener('animationend', function(event) {
            if (event.animationName === 'fadeout') {
                message.remove();
            }
        });

        // Automatically close any open modal upon success
        if (message.classList.contains('success')) {
            signupModal.style.display = 'none';
            loginModal.style.display = 'none';
        }

        // Reopen modals on error
        if (message.classList.contains('danger') || message.classList.contains('error')) {
            const errorText = message.textContent.toLowerCase();

            if (errorText.includes('signup')) {
                signupModal.style.display = 'block';
            } else if (errorText.includes('login')) {
                loginModal.style.display = 'block';
            }
        }
    });
}

// Handle search input
const searchBar = document.getElementById('search-bar');
const debounceDelay = 500;
let debounceTimer;

if (searchBar) {
    searchBar.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const query = searchBar.value.trim();

        debounceTimer = setTimeout(() => {
            if (query) {
                searchMovies(query);
                // Optionally, clear active category highlighting when searching
                updateActiveCategoryLink(null);
            } else {
                // Re-fetch movies based on the current category
                fetchMoviesByCategory(currentCategory);
                // Update active category link
                updateActiveCategoryLink(currentCategory);
            }
        }, debounceDelay);
    });
}

// Function to search movies
function searchMovies(query) {
    const url = `${searchMoviesUrl}${encodeURIComponent(query)}`;
    fetchMovies(url);
    // Reset category and genre selections
    currentCategory = null;
    currentGenreId = null;
    updateActiveCategoryLink(null);
    updateActiveGenreLink(null);
}

// Initialize functions after DOM content is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Fetch movies for the default category
    fetchMoviesByCategory(currentCategory);

    // Handle category clicks
    handleCategoryClicks();

    // Handle genre clicks
    handleGenreClicks();

    // Existing function calls
    handleAuthModalsAndMessages();
});
