const API_URL = 'https://gutendex.com/books';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const wishlistContainer = document.getElementById('wishlist-container');
const loadingSkeleton = document.getElementById('loading-skeleton');
const errorMessage = document.getElementById('error-message');

async function fetchWishlistBooks() {
    showLoadingSkeleton();
    hideErrorMessage();
    try {
        const books = await Promise.all(wishlist.map(async (id) => {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch book with id ${id}`);
            }
            return response.json();
        }));
        displayWishlistBooks(books);
    } catch (error) {
        console.error('Error fetching wishlist books:', error);
        showErrorMessage('Failed to fetch wishlist books. Please try again later.');
    } finally {
        hideLoadingSkeleton();
    }
}

function displayWishlistBooks(books) {
    wishlistContainer.innerHTML = '';
    if (books.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }
    books.forEach((book, index) => {
        const bookCard = createBookCard(book);
        wishlistContainer.appendChild(bookCard);
        setTimeout(() => bookCard.classList.add('visible'), 50 * index);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${book.formats['image/jpeg']}" alt="${book.title}">
        <h3><a href="book-details.html?id=${book.id}">${book.title}</a></h3>
        <p>${book.authors.map(author => author.name).join(', ')}</p>
        <p>ID: ${book.id}</p>
        <p>Genre: ${book.bookshelves ? `${book.bookshelves.slice(0, 3).join(', ')}${book.bookshelves?.length > 3 ? `...` : ""}` : 'Unknown'}</p>
        <button class="wishlist-toggle" data-id="${book.id}">❤️</button>
    `;
    card.querySelector('.wishlist-toggle').addEventListener('click', removeFromWishlist);
    return card;
}

function removeFromWishlist(e) {
    const bookId = parseInt(e.target.dataset.id);
    wishlist = wishlist.filter(id => id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    fetchWishlistBooks();
}

function showLoadingSkeleton() {
    loadingSkeleton.style.display = 'grid';
    wishlistContainer.style.display = 'none';
}

function hideLoadingSkeleton() {
    loadingSkeleton.style.display = 'none';
    wishlistContainer.style.display = 'grid';
}

function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    wishlistContainer.style.display = 'none';
}

function hideErrorMessage() {
    errorMessage.style.display = 'none';
}

fetchWishlistBooks();