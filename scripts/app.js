const API_URL = 'https://gutendex.com/books';
let currentPage = 1;
let booksData = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genre-filter');
const booksContainer = document.getElementById('books-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const loadingSkeleton = document.getElementById('loading-skeleton');
const errorMessage = document.getElementById('error-message');

// Fetch books data
async function fetchBooks(page = 1, search = '') {
    showLoadingSkeleton();
    hideErrorMessage();
    try {
        const response = await fetch(`${API_URL}?page=${page}&search=${search}`);
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        booksData = data.results;
        updateGenreFilter();
        displayBooks();
    } catch (error) {
        console.error('Error fetching books:', error);
        showErrorMessage('Failed to fetch books. Please try again later.');
    } finally {
        hideLoadingSkeleton();
    }
}

// Display books
function displayBooks() {
    booksContainer.innerHTML = '';
    booksData.forEach((book, index) => {
        const bookCard = createBookCard(book);
        booksContainer.appendChild(bookCard);
        setTimeout(() => bookCard.classList.add('visible'), 50 * index);
    });
}

// Create book card
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${book.formats['image/jpeg']}" alt="${book.title}">
        <h3><a href="book-details.html?id=${book.id}">${book.title}</a></h3>
        <p>${book.authors.map(author => author.name).join(', ')}</p>
        <p>ID: ${book.id}</p>
        <button class="wishlist-toggle" data-id="${book.id}">
            ${wishlist.includes(book.id) ? '❤️' : '🤍'}
        </button>
    `;
    card.querySelector('.wishlist-toggle').addEventListener('click', toggleWishlist);
    return card;
}

// Toggle wishlist
function toggleWishlist(e) {
    const bookId = parseInt(e.target.dataset.id);
    const index = wishlist.indexOf(bookId);
    if (index === -1) {
        wishlist.push(bookId);
        e.target.textContent = '❤️';
    } else {
        wishlist.splice(index, 1);
        e.target.textContent = '🤍';
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Update genre filter
function updateGenreFilter() {
    const genres = new Set();
    booksData.forEach(book => {
        book.bookshelves.forEach(genre => genres.add(genre));
    });
    genreFilter.innerHTML = '<option value="">All Genres</option>';
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// Show loading skeleton
function showLoadingSkeleton() {
    loadingSkeleton.style.display = 'grid';
    booksContainer.style.display = 'none';
}

// Hide loading skeleton
function hideLoadingSkeleton() {
    loadingSkeleton.style.display = 'none';
    booksContainer.style.display = 'grid';
}

// Show error message
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    booksContainer.style.display = 'none';
}

// Hide error message
function hideErrorMessage() {
    errorMessage.style.display = 'none';
}

// Event listeners
searchInput.addEventListener('input', debounce(() => {
    currentPage = 1;
    fetchBooks(currentPage, searchInput.value);
}, 300));

genreFilter.addEventListener('change', () => {
    const selectedGenre = genreFilter.value;
    if (selectedGenre) {
        booksContainer.innerHTML = '';
        booksData.filter(book => book.bookshelves.includes(selectedGenre))
            .forEach((book, index) => {
                const bookCard = createBookCard(book);
                booksContainer.appendChild(bookCard);
                setTimeout(() => bookCard.classList.add('visible'), 50 * index);
            });
    } else {
        displayBooks();
    }
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchBooks(currentPage, searchInput.value);
        currentPageSpan.textContent = currentPage;
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    fetchBooks(currentPage, searchInput.value);
    currentPageSpan.textContent = currentPage;
});

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Initial fetch
fetchBooks();

// Load preferences from localStorage
window.addEventListener('load', () => {
    const savedSearch = localStorage.getItem('savedSearch');
    const savedGenre = localStorage.getItem('savedGenre');
    if (savedSearch) {
        searchInput.value = savedSearch;
        fetchBooks(currentPage, savedSearch);
    }
    if (savedGenre) {
        genreFilter.value = savedGenre;
    }
});

// Save preferences to localStorage
window.addEventListener('beforeunload', () => {
    localStorage.setItem('savedSearch', searchInput.value);
    localStorage.setItem('savedGenre', genreFilter.value);
});