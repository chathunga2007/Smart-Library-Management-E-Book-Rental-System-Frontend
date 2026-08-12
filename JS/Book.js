$(document).ready(function() {
    loadAllBooks();
});

function handleSave(){
    let title = ($('#title').val() || $('#book-title').val() || '').trim();
    let author = ($('#author').val() || $('#book-author').val() || '').trim();
    let isbn = ($('#isbn').val() || $('#book-isbn').val() || '').trim();
    let category = ($('#category').val() || $('#book-category').val() || '').trim();
    let totalCopies = parseInt($('#totalCopies').val() || $('#book-totalCopies').val()) || 1;
    let availableCopies = parseInt($('#availableCopies').val() || $('#book-availableCopies').val()) || 1;
    let filePath = ($('#filePath').val() || $('#book-filePath').val() || '').trim();
    let bookStatus = $('#bookStatus').val() || $('#book-status').val() || "AVAILABLE";

    if(!title) {
        alert("Please enter Book Title.");
        return;
    }
    if(!author) {
        alert("Please enter Author.");
        return;
    }
    if(!isbn) {
        alert("Please enter ISBN Number.");
        return;
    }

    let obj = JSON.stringify({
        "title": title,
        "author": author,
        "isbn": isbn,
        "category": category,
        "totalCopies": totalCopies,
        "availableCopies": availableCopies,
        "filePath": filePath,
        "bookStatus": bookStatus
    });

    $.ajax({
        url: "http://localhost:8080/api/books",
        type: "POST",
        contentType: "application/json",
        data: obj,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Book saved successfully!");
            handleClear();
            if(typeof closeModal === 'function') closeModal('modal-add-book');
            loadAllBooks();
        },
        error: function(response){
            console.error("Error saving book:", response);
            alert("Error saving book.");
        }
    });
}

function handleUpdate(){
    let bookId = ($('#bookId').val() || $('#edit-book-id').val() || '').trim();
    let title = ($('#title').val() || $('#edit-book-title').val() || '').trim();
    let author = ($('#author').val() || $('#edit-book-author').val() || '').trim();
    let isbn = ($('#isbn').val() || $('#edit-book-isbn').val() || '').trim();
    let category = ($('#category').val() || $('#edit-book-category').val() || '').trim();
    let totalCopies = parseInt($('#totalCopies').val() || $('#edit-book-total').val()) || 1;
    let availableCopies = parseInt($('#availableCopies').val() || $('#edit-book-avail').val()) || 0;
    let filePath = ($('#filePath').val() || $('#edit-book-file').val() || '').trim();
    let bookStatus = $('#bookStatus').val() || $('#edit-book-status').val() || "AVAILABLE";

    if(!bookId) {
        alert("Please select a book to update!");
        return;
    }
    if(!title) {
        alert("Please enter Book Title.");
        return;
    }

    let obj = JSON.stringify({
        "id": parseInt(bookId),
        "bookId": parseInt(bookId),
        "title": title,
        "author": author,
        "isbn": isbn,
        "category": category,
        "totalCopies": totalCopies,
        "availableCopies": availableCopies,
        "filePath": filePath,
        "bookStatus": bookStatus
    });

    $.ajax({
        url: "http://localhost:8080/api/books",
        type: "PUT",
        contentType: "application/json",
        data: obj,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Book updated successfully!");
            handleClear();
            if(typeof closeModal === 'function') closeModal('modal-edit-book');
            loadAllBooks();
        },
        error: function(response){
            console.error("Error updating book:", response);
            alert("Error updating book.");
        }
    });
}

function handleDelete(id){
    let bookId = id || ($('#bookId').val() || $('#edit-book-id').val() || '').trim();

    if(!bookId) {
        alert("Please select or enter a Book ID to delete!");
        return;
    }

    if(!confirm("Are you sure you want to delete Book ID: " + bookId + "?")) {
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/books/" + bookId,
        type: "DELETE",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Book deleted successfully!");
            handleClear();
            loadAllBooks();
        },
        error: function(response){
            console.error("Error deleting book:", response);
            alert("Error deleting book.");
        }
    });
}

function handleSearch(){
    let query = ($('#search-query').val() || $('#filterTitle').val() || '').trim();
    if (!query) {
        query = prompt("Enter Book Title or ID to search:");
    }
    if(!query) return;

    $.ajax({
        url: "http://localhost:8080/api/books/search?query=" + encodeURIComponent(query),
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            let list = response.body || response.data || response;
            renderBookTable(Array.isArray(list) ? list : (list ? [list] : []));
        },
        error: function(response){
            alert("Book not found.");
        }
    });
}

function handleFilter(){
    let searchName = ($('#filterTitle').val() || $('#search-query').val() || '').trim();
    if(!searchName) {
        loadAllBooks();
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/books/search?query=" + encodeURIComponent(searchName),
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            let list = response.body || response.data || response;
            renderBookTable(Array.isArray(list) ? list : []);
        },
        error: function(response){
            alert("Error filtering books.");
        }
    });
}

function handleClear(){
    $('#bookId, #edit-book-id').val('');
    $('#title, #book-title, #edit-book-title').val('');
    $('#author, #book-author, #edit-book-author').val('');
    $('#isbn, #book-isbn, #edit-book-isbn').val('');
    $('#category, #book-category, #edit-book-category').val('');
    $('#totalCopies, #book-totalCopies, #edit-book-total').val('1');
    $('#availableCopies, #book-availableCopies, #edit-book-avail').val('1');
    $('#filePath, #book-filePath, #edit-book-file').val('');
    $('#filterTitle, #search-query').val('');
}

function loadAllBooks(){
    $.ajax({
        url: "http://localhost:8080/api/books/all",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            let list = response.body || response.data || response;
            window.allBooksList = Array.isArray(list) ? list : [];
            renderBookTable(window.allBooksList);
        },
        error: function(response){
            console.error("Failed to load books", response);
        }
    });
}

function renderBookTable(list) {
    let rows = "";
    if (!list || list.length === 0) {
        rows = `<tr><td colspan="10" style="text-align: center; color: var(--text-dim);">No books found in catalog.</td></tr>`;
    } else {
        list.forEach(b => {
            let bId = b.id || b.bookId;
            let status = b.bookStatus || (b.isAvailable ? 'AVAILABLE' : 'NOT_AVAILABLE');
            let badgeClass = status === 'AVAILABLE' ? 'badge-available' : (status === 'NOT_AVAILABLE' ? 'badge-not-available' : 'badge-deleted');
            
            let safeTitle = (b.title || '').replace(/'/g, "\\'");
            let safeAuthor = (b.author || '').replace(/'/g, "\\'");
            let safeIsbn = (b.isbn || '').replace(/'/g, "\\'");
            let safeCategory = (b.category || '').replace(/'/g, "\\'");
            let safeFile = (b.filePath || '').replace(/'/g, "\\'");

            rows += `<tr>
                <td>#${bId}</td>
                <td><strong>${b.title}</strong></td>
                <td>${b.author}</td>
                <td><code>${b.isbn || '-'}</code></td>
                <td><span class="badge" style="background: rgba(255,255,255,0.08); color:#fff;">${b.category || 'General'}</span></td>
                <td>${b.totalCopies !== undefined ? b.totalCopies : 1}</td>
                <td><strong>${b.availableCopies !== undefined ? b.availableCopies : 1}</strong></td>
                <td><code style="font-size:11px;">${b.filePath || '-'}</code></td>
                <td><span class="badge ${badgeClass}">${status}</span></td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-secondary" onclick="selectBookForEdit(${bId}, '${safeTitle}', '${safeAuthor}', '${safeIsbn}', '${safeCategory}', ${b.totalCopies || 1}, ${b.availableCopies || 1}, '${safeFile}', '${status}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="handleDelete(${bId})">Delete</button>
                    </div>
                </td>
            </tr>`;
        });
    }
    $('#books-tbody, #bookTblBody').html(rows);
}

function selectBookForEdit(id, title, author, isbn, category, totalCopies, availableCopies, filePath, bookStatus) {
    $('#bookId, #edit-book-id').val(id);
    $('#title, #book-title, #edit-book-title').val(title);
    $('#author, #book-author, #edit-book-author').val(author);
    $('#isbn, #book-isbn, #edit-book-isbn').val(isbn);
    $('#category, #book-category, #edit-book-category').val(category);
    $('#totalCopies, #book-totalCopies, #edit-book-total').val(totalCopies);
    $('#availableCopies, #book-availableCopies, #edit-book-avail').val(availableCopies);
    $('#filePath, #book-filePath, #edit-book-file').val(filePath);
    $('#bookStatus, #book-status, #edit-book-status').val(bookStatus);

    if (typeof openModal === 'function') {
        openModal("modal-edit-book");
    }
}

function loadBooks() { loadAllBooks(); }
function saveBookDetails() { handleSave(); }
function updateBookDetails() { handleUpdate(); }
function deleteBook(id) { handleDelete(id); }
function searchBooks() { handleSearch(); }
function openAddBookModal() {
    handleClear();
    if (typeof openModal === 'function') openModal("modal-add-book");
}
function editBook(id) {
    let b = (window.allBooksList || []).find(item => item.id == id || item.bookId == id);
    if (b) {
        selectBookForEdit(b.id || b.bookId, b.title, b.author, b.isbn, b.category, b.totalCopies, b.availableCopies, b.filePath, b.bookStatus);
    }
}