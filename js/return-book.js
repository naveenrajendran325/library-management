document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('return-book')) return;
  const table = document.getElementById('returnTable');
  const search = document.getElementById('returnSearch');

  function render() {
    const term = search.value.trim().toLowerCase();
    const issues = LibraryStorage.issues().filter(issue =>
      !term || [issue.issueId, issue.memberName, issue.bookName].some(value => String(value).toLowerCase().includes(term))
    ).slice().reverse();
    table.innerHTML = issues.length ? `
      <table><thead><tr><th>Issue ID</th><th>Member Name</th><th>Book Name</th><th>Issue Date</th><th>Return Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${issues.map(issue => {
        const isReturned = issue.status === 'Returned';
        return `<tr><td>${libraryCommon.escapeHtml(issue.issueId)}</td><td>${libraryCommon.escapeHtml(issue.memberName)}</td><td>${libraryCommon.escapeHtml(issue.bookName)}</td><td>${libraryCommon.formatDate(issue.issueDate)}</td><td>${isReturned ? libraryCommon.formatDate(issue.actualReturnDate) : `<input class="form-control return-date" type="date" data-date="${libraryCommon.escapeHtml(issue.issueId)}" value="${new Date().toISOString().slice(0,10)}" min="${libraryCommon.escapeHtml(issue.issueDate)}">`}</td><td><span class="badge ${isReturned ? 'badge-returned' : 'badge-issued'}">${issue.status}</span></td><td>${isReturned ? '-' : `<button class="btn btn-success" type="button" data-return="${libraryCommon.escapeHtml(issue.issueId)}">Return</button>`}</td></tr>`;
      }).join('')}</tbody></table>` : '<div class="empty-state">No issue records found.</div>';
  }

  search.addEventListener('input', render);
  document.getElementById('clearReturnSearch').addEventListener('click', () => { search.value = ''; render(); });
  table.addEventListener('click', event => {
    const button = event.target.closest('[data-return]');
    if (!button) return;
    const issueId = button.dataset.return;
    const issue = LibraryStorage.findById(LibraryStorage.issues(), 'issueId', issueId);
    if (!issue || issue.status === 'Returned') return libraryCommon.notify('This issue is already returned.', 'error');
    const dateInput = [...table.querySelectorAll('[data-date]')]
      .find(input => input.dataset.date === issueId);
    const actualReturnDate = dateInput?.value;
    if (!actualReturnDate) return libraryCommon.notify('Please select a return date.', 'error');
    if (actualReturnDate < issue.issueDate) return libraryCommon.notify('Return date cannot be before the issue date.', 'error');

    LibraryStorage.updateRecord(LibraryStorage.KEYS.issues, 'issueId', issueId, { actualReturnDate, status: 'Returned' });
    const book = LibraryStorage.findById(LibraryStorage.books(), 'bookId', issue.bookId);
    if (book) {
      LibraryStorage.updateRecord(LibraryStorage.KEYS.books, 'bookId', book.bookId, {
        availableQuantity: Math.min(Number(book.quantity), Number(book.availableQuantity) + 1)
      });
    }
    libraryCommon.notify('Book returned successfully.');
    render();
  });
  render();
});
