document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('books')) return;
  const table = document.getElementById('booksTable');
  const search = document.getElementById('bookSearch');
  const filter = document.getElementById('categoryFilter');

  function populateCategories() {
    const categories = [...new Set(LibraryStorage.books().map(book => book.category).filter(Boolean))].sort();
    const current = filter.value;
    filter.innerHTML = '<option value="">All Categories</option>' + categories.map(category => `<option>${libraryCommon.escapeHtml(category)}</option>`).join('');
    filter.value = current;
  }

  function render() {
    populateCategories();
    const term = search.value.trim().toLowerCase();
    const category = filter.value;
    const books = LibraryStorage.books().filter(book =>
      (!category || book.category === category) &&
      (!term || [book.bookName, book.author, book.category].some(value => String(value).toLowerCase().includes(term)))
    );
    table.innerHTML = books.length ? `
      <table><thead><tr><th>Book ID</th><th>Book Name</th><th>Author</th><th>Category</th><th>Quantity</th><th>Available</th><th>Action</th></tr></thead>
      <tbody>${books.map(book => `
        <tr><td>${libraryCommon.escapeHtml(book.bookId)}</td><td><strong>${libraryCommon.escapeHtml(book.bookName)}</strong></td><td>${libraryCommon.escapeHtml(book.author)}</td><td><span class="category-chip">${libraryCommon.escapeHtml(book.category)}</span></td><td>${book.quantity}</td><td>${book.availableQuantity}</td><td><div class="action-buttons"><button class="icon-button" type="button" data-edit="${libraryCommon.escapeHtml(book.bookId)}" title="Edit">✎</button><button class="icon-button danger" type="button" data-delete="${libraryCommon.escapeHtml(book.bookId)}" title="Delete">×</button></div></td></tr>
      `).join('')}</tbody></table>` : '<div class="empty-state">No books match the current filters.</div>';
  }

  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  document.getElementById('clearBookSearch').addEventListener('click', () => { search.value = ''; filter.value = ''; render(); });
  table.addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) window.location.href = `add-book.html?id=${encodeURIComponent(edit.dataset.edit)}`;
    if (remove) {
      const bookId = remove.dataset.delete;
      const activeIssue = LibraryStorage.issues().some(issue => issue.bookId === bookId && issue.status === 'Issued');
      if (activeIssue) return libraryCommon.notify('Cannot delete a book with an active issue record.', 'error');
      if (!confirm('Delete this book record?')) return;
      LibraryStorage.deleteRecord(LibraryStorage.KEYS.books, 'bookId', bookId);
      libraryCommon.notify('Book deleted successfully.');
      render();
    }
  });
  render();
});
