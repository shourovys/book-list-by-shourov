// Function to display books on the page
function displayBooks(books) {
  const booksList = document.getElementById('books-list');
  booksList.innerHTML = ''; // Clear previous content

  books.forEach((book) => {
    // Create a book card
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');

    // Get book details
    const title = book.title;
    const author =
      book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';
    const coverImage = book.formats['image/jpeg'] || 'default-cover.jpg'; // Use a default if no cover is available
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

// Function to fetch books from the Gutendex API
async function fetchBooks() {
  try {
    const response = await fetch('https://gutendex.com/books/');
    const data = await response.json();
    displayBooks(data.results);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

// Fetch books on page load
window.onload = fetchBooks;
