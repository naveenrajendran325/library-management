document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('books')) return;
  const form = document.getElementById('bookForm');
  const message = document.getElementById('bookMessage');
  const editId = new URLSearchParams(window.location.search).get('id');
  const bookIdInput = document.getElementById('bookId');

  if (editId) {
    const book = LibraryStorage.findById(LibraryStorage.books(), 'bookId', editId);
    if (!book) {
      message.className = 'message error';
      message.textContent = 'Book record was not found.';
    } else {
      document.getElementById('bookFormTitle').textContent = 'Edit Book';
      Object.entries(book).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
      bookIdInput.readOnly = true;
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const quantity = Number(data.quantity);
    message.className = 'message';
    if (!data.bookId.trim() || !data.bookName.trim() || !data.author.trim() || !data.category.trim() || !data.publisher.trim() || !data.publicationYear || quantity < 1) {
      message.className = 'message error';
      message.textContent = 'Please complete all fields with a valid quantity.';
      return;
    }
    const existing = LibraryStorage.findById(LibraryStorage.books(), 'bookId', data.bookId);
    if (!editId && existing) {
      message.className = 'message error';
      message.textContent = 'Book ID already exists.';
      return;
    }
    if (editId) {
      const oldBook = LibraryStorage.findById(LibraryStorage.books(), 'bookId', editId);
      const issuedCount = LibraryStorage.issues().filter(issue => issue.bookId === editId && issue.status === 'Issued').length;
      if (quantity < issuedCount) {
        message.className = 'message error';
        message.textContent = 'Quantity cannot be lower than the number of active issued copies.';
        return;
      }
      const availableQuantity = quantity - issuedCount;
      LibraryStorage.updateRecord(LibraryStorage.KEYS.books, 'bookId', editId, {
        bookId: oldBook.bookId, bookName: data.bookName.trim(), author: data.author.trim(),
        category: data.category.trim(), publisher: data.publisher.trim(),
        publicationYear: data.publicationYear, quantity, availableQuantity
      });
      libraryCommon.notify('Book updated successfully.');
    } else {
      LibraryStorage.addRecord(LibraryStorage.KEYS.books, {
        bookId: data.bookId.trim(), bookName: data.bookName.trim(), author: data.author.trim(),
        category: data.category.trim(), publisher: data.publisher.trim(),
        publicationYear: data.publicationYear, quantity, availableQuantity: quantity
      });
      libraryCommon.notify('Book added successfully.');
    }
    setTimeout(() => window.location.href = 'books.html', 700);
  });
});
