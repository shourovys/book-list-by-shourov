// Function to get wish listed book IDs from localStorage
function getWishlistIds() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  return wishlist;
}

// Fetch books based on wishlisted IDs
async function fetchWishlistBooks() {
  const wishlistIds = getWishlistIds();

  if (wishlistIds.length === 0) {
    document.getElementById('wishlist-container').innerHTML =
      '<p>No books in wishlist.</p>';
    return;
  }

  const feedbackElement = document.getElementById('feedback');
  feedbackElement.style.display = 'block';

  try {
    // Create the API URL with the wishlisted IDs
    const idsQuery = wishlistIds.join(',');
    const apiUrl = `https://gutendex.com/books?ids=${idsQuery}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    feedbackElement.style.display = 'none';

    // Display books in the wishlist
    displayWishlistBooks(data.results);
  } catch (error) {
    console.error('Error fetching wishlist books:', error);
    feedbackElement.innerText =
      'Failed to load wishlist. Please try again later';
  }
}

// Function to display books in the wishlist
function displayWishlistBooks(books) {
  const wishlistContainer = document.getElementById('books-list');
  wishlistContainer.innerHTML = '';

  books.forEach((book) => {
    const bookElement = document.createElement('div');
    bookElement.classList.add('book-card');

    // Get book cover image (we assume the first image format in the object)
    const coverImage = book.formats['image/jpeg'] || 'assets/default-cover.png';

    // Create book element HTML
    bookElement.innerHTML = `
      <img src="${coverImage}" alt="${book.title} cover" class="book-cover">
      <h3>${book.title}</h3>
      <p>Author: ${book.authors.map((author) => author.name).join(', ')}</p>
      <p>Genre: ${book.subjects.join(', ')}</p>
      <p>Book Id: ${book.id}</p>
      <button class="remove-from-wishlist" data-id="${
        book.id
      }">Remove from Wishlist</button>
    `;

    // Append the book element to the wishlist container
    wishlistContainer.appendChild(bookElement);
  });

  // Add event listeners for removing books from wishlist
  document.querySelectorAll('.remove-from-wishlist').forEach((button) => {
    button.addEventListener('click', (e) => {
      const bookId = parseInt(e.target.getAttribute('data-id'));
      removeFromWishlist(bookId);
    });
  });
}

// Function to remove book from wishlist
function removeFromWishlist(bookId) {
  let wishlist = getWishlistIds();
  wishlist = wishlist.filter((id) => id !== bookId);

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  fetchWishlistBooks(); // Refresh wishlist after removal
}

// Fetch and display wishlist books when the page loads
window.onload = () => {
  fetchWishlistBooks();
};
