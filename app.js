// Debounce function to limit API calls while typing
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Function to fetch genres/topics from the Gutendex API
async function fetchGenres() {
  try {
    const response = await fetch('https://gutendex.com/books/');
    const data = await response.json();

    const genres = new Set();

    // Loop through books to collect unique genres from 'subjects' or 'bookshelves'
    data.results.forEach((book) => {
      book.subjects.forEach((subject) => genres.add(subject));
    });

    populateGenreDropdown([...genres]);
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

// Function to populate the genre dropdown
function populateGenreDropdown(genres) {
  const genreFilter = document.getElementById('genre-filter');

  genres.forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

let currentPage = 1;
let totalPages = 1;
let nextPageUrl = null;
let prevPageUrl = null;
const booksParPage = 32;

// Function to fetch books and handle pagination
async function fetchBooks(query = '', genre = '', pageUrl = '') {
  const feedbackElement = document.getElementById('feedback');
  const booksList = document.getElementById('books-list');

  // Show loading feedback
  feedbackElement.style.display = 'block';

  try {
    let apiUrl = pageUrl
      ? pageUrl
      : `https://gutendex.com/books?search=${encodeURIComponent(query)}`;

    if (genre) {
      apiUrl += `&topic=${encodeURIComponent(genre)}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Hide loading feedback after data is received
    feedbackElement.style.display = 'none';

    // Update pagination information
    nextPageUrl = data.next;
    prevPageUrl = data.previous;
    totalPages = Math.ceil(data.count / booksParPage);

    displayBooks(data.results); // Display books
    updatePaginationControls(query, genre); // Update pagination buttons
  } catch (error) {
    console.error('Error fetching books:', error);

    // Optionally show an error message
    feedbackElement.innerText = 'Failed to load books. Please try again later.';
  }
}

// Update the pagination controls (Next, Previous, Page Numbers)
function updatePaginationControls(query, genre) {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageNumbersContainer = document.getElementById('page-numbers');

  // Enable or disable "Previous" button
  prevBtn.disabled = !prevPageUrl;

  // Enable or disable "Next" button
  nextBtn.disabled = !nextPageUrl;

  // Clear current page numbers
  pageNumbersContainer.innerHTML = '';

  // Display page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageNumber = document.createElement('span');
    pageNumber.textContent = i;
    pageNumber.classList.add('page-number');

    if (i === currentPage) {
      pageNumber.classList.add('active');
    }

    pageNumber.addEventListener('click', () => {
      currentPage = i;
      let newPageUrl = `https://gutendex.com/books?page=${currentPage}&search=${encodeURIComponent(
        query
      )}`;

      if (genre) {
        fetchBooks(
          query,
          genre,
          `${newPageUrl}&topic=${encodeURIComponent(genre)}`
        ); // Fetch books with query and genre
      } else {
        fetchBooks(query, '', newPageUrl); // Fetch books with query only
      }
    });

    pageNumbersContainer.appendChild(pageNumber);
  }
}

// Event listeners for "Next" and "Previous" buttons
document.getElementById('next-page').addEventListener('click', () => {
  if (nextPageUrl) {
    currentPage += 1;
    fetchBooks('', '', nextPageUrl); // Fetch the next page
  }
});

document.getElementById('prev-page').addEventListener('click', () => {
  if (prevPageUrl) {
    currentPage -= 1;
    fetchBooks('', '', prevPageUrl); // Fetch the previous page
  }
});

// Function to display books on the page
function displayBooks(books) {
  const booksList = document.getElementById('books-list');
  booksList.innerHTML = ''; // Clear previous content

  const wishlist = getWishlist(); // Get the wishlist from localStorage

  if (books.length === 0) {
    booksList.innerHTML = '<p>No books found.</p>';
    return;
  }

  books.forEach((book) => {
    // Create a book card
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');

    // Get book details
    const title = book.title;
    const author =
      book.authors.length > 0
        ? book.authors.map((author) => author.name).join(', ')
        : 'Unknown Author';
    const coverImage = book.formats['image/jpeg'] || 'default-cover.png'; // Use a default if no cover is available
    const genre =
      book.subjects.length > 0 ? book.subjects.join(', ') : 'Unknown Genre';
    const bookId = book.id;

    // Create the HTML structure for the book card
    bookCard.innerHTML = `
      <img src="${coverImage}" alt="${title} cover" class="book-cover">
      <h3>${title}</h3>
      <p>Author: ${author}</p>
      <p>Genre: ${genre}</p>
      <span class="like-icon ${
        wishlist.includes(bookId) ? 'active' : ''
      }" data-id="${bookId}">&hearts;</span>
    `;

    // Add event listener to the like icon
    const likeIcon = bookCard.querySelector('.like-icon');
    likeIcon.addEventListener('click', () => toggleWishlist(bookId, likeIcon));

    // Append the book card to the books list
    booksList.appendChild(bookCard);
  });
}

// Get the wishlist from localStorage
function getWishlist() {
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

// Save the wishlist to localStorage
function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Toggle the wishlist (add/remove book)
function toggleWishlist(bookId, icon) {
  let wishlist = getWishlist();

  if (wishlist.includes(bookId)) {
    // If the book is already in the wishlist, remove it
    wishlist = wishlist.filter((id) => id !== bookId);
    icon.classList.remove('active'); // Change icon to unliked state
  } else {
    // If the book is not in the wishlist, add it
    wishlist.push(bookId);
    icon.classList.add('active'); // Change icon to liked state
  }

  // Save the updated wishlist to localStorage
  saveWishlist(wishlist);
}

// Event listener for real-time search with debounce
document.getElementById('search-bar').addEventListener(
  'input',
  debounce((e) => {
    const query = e.target.value;
    const selectedGenre = document.getElementById('genre-filter').value;
    fetchBooks(query, selectedGenre); // Fetch books based on search query and selected genre
  }, 300)
);

// Event listener for genre filter
document.getElementById('genre-filter').addEventListener('change', () => {
  const query = document.getElementById('search-bar').value;
  const selectedGenre = document.getElementById('genre-filter').value;
  fetchBooks(query, selectedGenre); // Fetch books based on selected genre
});

// Fetch books and genres on page load
window.onload = () => {
  fetchBooks(); // Fetch all books initially
  fetchGenres(); // Fetch available genres
};
