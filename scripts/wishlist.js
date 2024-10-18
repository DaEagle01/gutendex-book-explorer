const API_URL = 'https://gutendex.com/books';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
const wishlistContainer = document.getElementById('wishlist-container');

// Display wishlist
async function displayWishlist() {
    wishlistContainer.innerHTML = '';
    for (let i = 0; i < wishlist.length; i++) {
        const bookId = wishlist[i];
        const response = await fetch(`${API_URL}/${bookId}`);
        const book = await response.json();
        const bookCard = createBookCard(book);
        wishlistContainer.appendChild(bookCard);
        setTimeout(() => bookCard.classList.add('visible'), 50 * i);
    }
}

// Create book card
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${book.formats['image/jpeg']}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>${book.authors.map(author => author.name).join(', ')}</p>
        <p>ID: ${book.id}</p>
        <button class="wishlist-toggle" data-id="${book.id}">❤️</button>
    `;
    card.querySelector('.wishlist-toggle').addEventListener('click', removeFromWishlist);
    return card;
}

// Remove from wishlist
function removeFromWishlist(e) {
    const bookId = parseInt(e.target.dataset.id);
    const index = wishlist.indexOf(bookId);
    if (index !== -1) {
        wishlist.splice(index, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        e.target.closest('.book-card').remove();
    }
}

// Initial display
displayWishlist();