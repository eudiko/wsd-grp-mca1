document.addEventListener('DOMContentLoaded', () => {
    const booksPerPage = 6;
    let currentPage = 1;
    let books = [];
    const genreSelect = document.getElementById('genre-select');
    const searchBar = document.getElementById('search');

    // Function to fetch books from Google Books API
    function fetchBooks(genre = '', query = '') {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}+${query}&maxResults=40`;
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                books = data.items.map(item => ({
                    title: item.volumeInfo.title,
                    author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
                    cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150',
                    preview: item.volumeInfo.previewLink ? item.volumeInfo.previewLink : './index.html'
                }));

                if (query) {
                    books = books.filter(book =>
                        book.title.toLowerCase().includes(query.toLowerCase()) ||
                        book.author.toLowerCase().includes(query.toLowerCase())
                    );
                }

                books.sort((a, b) => a.title.localeCompare(b.title));

                displayBooks(currentPage);
                setupPagination();
            })
            .catch(error => {
                document.getElementById('book-list').innerHTML = `<p>Error: ${error.message}</p>`;
            });
    }

    // Function to display books on the current page
    function displayBooks(page = 1) {
        const startIndex = (page - 1) * booksPerPage;
        const endIndex = startIndex + booksPerPage;
        const booksToDisplay = books.slice(startIndex, endIndex);
    
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = '';
        booksToDisplay.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <a href="${book.preview}" style="text-decoration:none">
                    <img src="${book.cover}" alt="${book.title}">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                </a>`;
            bookList.appendChild(bookItem);
        });
    }

    // Function to setup pagination
    function setupPagination() {
        const totalPages = Math.ceil(books.length / booksPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                displayBooks(currentPage);
                setupPagination();
            });
            pagination.appendChild(pageItem);
        }
    }

    // Function to handle search input and genre selection
    function handleSearch() {
        currentPage = 1; 
        fetchBooks(genreSelect.value, searchBar.value.trim());
    }

    genreSelect.addEventListener('change', handleSearch);
    searchBar.addEventListener('input', handleSearch);

    // Handle form submission with modal confirmation
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual form submission
            const loginModal = new bootstrap.Modal(document.getElementById('saveChangesModal'));
            loginModal.show();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual form submission
            const signupModal = new bootstrap.Modal(document.getElementById('saveChangesModal'));
            signupModal.show();
        });
    }

    // Confirm save changes
    document.getElementById('confirmSave')?.addEventListener('click', function() {
        const activeForm = document.querySelector('form');
        activeForm.submit();
    });

    // Initial fetch for the default genre
    fetchBooks();
});
