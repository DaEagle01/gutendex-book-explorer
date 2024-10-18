const API_URL = 'https://gutendex.com/books';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const bookTitle = document.getElementById('book-title');
const bookCover = document.getElementById('book-cover');
const bookAuthors = document.getElementById('book-authors');
const bookGenres = document.getElementById('book-genres');
const bookDownloads = document.getElementById('book-downloads');
const bookLanguages = document.getElementById('book-languages');
const bookCopyright = document.getElementById('book-copyright');
const bookDescription = document.getElementById('book-description');
const bookDownloadLinks = document.getElementById('book-download-links');
const wishlistToggle = document.getElementById('wishlist-toggle');
const loadingSkeleton = document.getElementById('loading-skeleton');
const errorMessage = document.getElementById('error-message');
const bookDetails = document.getElementById('book-details');

// Get book ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

// Fetch book details
async function fetchBookDetails() {
    showLoadingSkeleton();
    hideErrorMessage();
    try {
        const response = await fetch(`${API_URL}/${bookId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        const book = await response.json();
        displayBookDetails(book);
    } catch (error) {
        console.error('Error fetching book details:', error);
        showErrorMessage('Failed to fetch book details. Please try again later.');
    } finally {
        hideLoadingSkeleton();
    }
}

// Display book details
function displayBookDetails(book) {
    document.title = `${book.title} - Gutendex Book Explorer`;
    bookTitle.textContent = book.title;
    bookCover.src = book.formats['image/jpeg'];
    bookCover.alt = book.title;
    bookAuthors.textContent = book.authors.map(author => author.name).join(', ');
    bookGenres.textContent = book.bookshelves.join(', ') || 'N/A';
    bookDownloads.textContent = book.download_count;
    bookLanguages.textContent = book.languages.join(', ');
    bookCopyright.textContent = book.copyright ? 'Yes' : 'No';
    bookDescription.textContent = 'No description available.'; // Project Gutenberg API doesn't provide book descriptions

    // Display download links
    bookDownloadLinks.innerHTML = '';
    Object.entries(book.formats).forEach(([format, url]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.textContent = format;
        a.target = '_blank';
        li.appendChild(a);
        bookDownloadLinks.appendChild(li);
    });

    // Set up wishlist toggle
    wishlistToggle.textContent = wishlist.includes(book.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist';
    wishlistToggle.addEventListener('click', () => toggleWishlist(book.id));
}

// Toggle wishlist
function toggleWishlist(bookId) {
    const index = wishlist.indexOf(bookId);
    if (index === -1) {
        wishlist.push(bookId);
        wishlistToggle.textContent = '❤️ Remove from Wishlist';
    } else {
        wishlist.splice(index, 1);
        wishlistToggle.textContent = '🤍 Add to Wishlist';
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Show loading skeleton
function showLoadingSkeleton() {
    loadingSkeleton.style.display = 'block';
    bookDetails.style.display = 'none';
}

// Hide loading skeleton
function hideLoadingSkeleton() {
    loadingSkeleton.style.display = 'none';
    bookDetails.style.display = 'block';
}

// Show error message
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    bookDetails.style.display = 'none';
}

// Hide error message
function hideErrorMessage() {
    errorMessage.style.display = 'none';
}

// Initial fetch
fetchBookDetails();