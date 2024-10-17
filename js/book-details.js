// Function to get query parameter from URL (book ID)
function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Fetch book details from API
async function fetchBookDetails(bookId) {
  const feedbackElement = document.getElementById('feedback');
  feedbackElement.style.display = 'block';

  try {
    const apiUrl = `https://gutendex.com/books/${bookId}`;
    const response = await fetch(apiUrl);
    const bookData = await response.json();

    feedbackElement.style.display = 'none';
    displayBookDetails(bookData);
  } catch (error) {
    console.error('Error fetching book details:', error);
    feedbackElement.style.display = 'none';
    feedbackElement.innerText = 'Failed to load book details. Please try again later.';
  }
}

// Function to display book details
function displayBookDetails(book) {
  const bookDetailsContainer = document.getElementById('book-details-container');
  
  const bookCover = book.formats['image/jpeg'] || 'default_cover_image.jpg'; // Get book cover image

  bookDetailsContainer.innerHTML = `
    <div class="book-details">
      <img src="${bookCover}" alt="${book.title}" class="book-cover">
      <div class="book-info">
        <h2>${book.title}</h2>
        <p><strong>Author(s):</strong> ${book.authors.map(author => author.name).join(', ')}</p>
        <p><strong>Genre(s):</strong> ${book.subjects.join(', ')}</p>
        <p><strong>Language(s):</strong> ${book.languages.join(', ')}</p>
        <p><strong>Download Count:</strong> ${book.download_count}</p>
        <p><strong>ID:</strong> ${book.id}</p>
      </div>
    </div>
  `;
}

// Functionality for the back button
// document.getElementById('back-button').addEventListener('click', () => {
//   window.history.back(); // Navigates to the previous page
// });

// On page load
const bookId = getBookIdFromUrl();
if (bookId) {
  fetchBookDetails(bookId);
} else {
  document.getElementById('feedback').innerText = 'No book ID provided.';
}
