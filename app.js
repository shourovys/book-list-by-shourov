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

// Function to fetch books from the Gutendex API based on search query and genre filter
async function fetchBooks(query = '', genre = '') {
  const loadingElement = document.getElementById('loading');
  const booksList = document.getElementById('books-list');

  // Show loading feedback
  loadingElement.style.display = 'block';

  try {
    let apiUrl = `https://gutendex.com/books/?search=${encodeURIComponent(
      query
    )}`;

    if (genre) {
      apiUrl += `&topic=${encodeURIComponent(genre)}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Hide loading feedback after data is received
    loadingElement.style.display = 'none';

    displayBooks(data.results); 
  } catch (error) {
    console.error('Error fetching books:', error);

    // Hide loading feedback if an error occurs
    loadingElement.style.display = 'none';

    // Optionally show an error message
    booksList.innerHTML =
      '<p>Failed to load books. Please try again later.</p>';
  }
}

// Function to display books on the page
function displayBooks(books) {
  const booksList = document.getElementById('books-list');
  booksList.innerHTML = ''; // Clear previous content

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
      book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';
    const coverImage = book.formats['image/jpeg'] || 'default-cover.png'; // Use a default if no cover is available
    const genre = book.subjects.length > 0 ? book.subjects[0] : 'Unknown Genre';

    // Create the HTML structure for the book card
    bookCard.innerHTML = `
      <img src="${coverImage}" alt="${title} cover" class="book-cover">
      <h3>${title}</h3>
      <p>Author: ${author}</p>
      <p>Genre: ${genre}</p>
    `;

    // Append the book card to the books list
    booksList.appendChild(bookCard);
  });
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
