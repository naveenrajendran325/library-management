document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('issue-book')) return;
  const form = document.getElementById('issueForm');
  const memberSelect = document.getElementById('issueMember');
  const bookSelect = document.getElementById('issueBook');
  const message = document.getElementById('issueMessage');
  const today = new Date().toISOString().slice(0, 10);

  function generateIssueId() {
    const issues = LibraryStorage.issues();
    let number = 1;
    while (issues.some(issue => issue.issueId === `ISS${String(number).padStart(4, '0')}`)) number++;
    return `ISS${String(number).padStart(4, '0')}`;
  }

  function populate() {
    const members = LibraryStorage.members();
    const books = LibraryStorage.books();
    memberSelect.innerHTML = '<option value="">Choose a member</option>' + members.map(member =>
      `<option value="${libraryCommon.escapeHtml(member.memberId)}">${libraryCommon.escapeHtml(member.fullName)} (${libraryCommon.escapeHtml(member.memberId)})</option>`
    ).join('');
    bookSelect.innerHTML = '<option value="">Choose a book</option>' + books.map(book =>
      `<option value="${libraryCommon.escapeHtml(book.bookId)}"${book.availableQuantity < 1 ? ' disabled' : ''}>${libraryCommon.escapeHtml(book.bookName)} (${book.availableQuantity} available)</option>`
    ).join('');
  }

  function renderTable() {
    const issues = LibraryStorage.issues().slice().reverse();
    document.getElementById('issuedTable').innerHTML = issues.length ? `
      <table><thead><tr><th>Issue ID</th><th>Member Name</th><th>Book Name</th><th>Issue Date</th><th>Expected Return Date</th><th>Status</th></tr></thead>
      <tbody>${issues.map(issue => `<tr><td>${libraryCommon.escapeHtml(issue.issueId)}</td><td>${libraryCommon.escapeHtml(issue.memberName)}</td><td>${libraryCommon.escapeHtml(issue.bookName)}</td><td>${libraryCommon.formatDate(issue.issueDate)}</td><td>${libraryCommon.formatDate(issue.expectedReturnDate)}</td><td><span class="badge ${issue.status === 'Returned' ? 'badge-returned' : 'badge-issued'}">${issue.status}</span></td></tr>`).join('')}</tbody></table>` :
      '<div class="empty-state">No issued book records yet.</div>';
  }

  document.getElementById('issueId').value = generateIssueId();
  document.getElementById('issueDate').value = today;
  document.getElementById('issueDate').min = today;
  populate();
  renderTable();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    message.className = 'message';
    if (!data.memberId || !data.bookId || !data.issueDate || !data.expectedReturnDate) {
      message.className = 'message error'; message.textContent = 'Please complete every field.'; return;
    }
    if (data.expectedReturnDate < data.issueDate) {
      message.className = 'message error'; message.textContent = 'Expected return date cannot be before the issue date.'; return;
    }
    const member = LibraryStorage.findById(LibraryStorage.members(), 'memberId', data.memberId);
    const book = LibraryStorage.findById(LibraryStorage.books(), 'bookId', data.bookId);
    if (!member) { message.className = 'message error'; message.textContent = 'Selected member does not exist.'; return; }
    if (!book) { message.className = 'message error'; message.textContent = 'Selected book does not exist.'; return; }
    if (Number(book.availableQuantity) < 1) { message.className = 'message error'; message.textContent = 'This book is unavailable because stock is zero.'; return; }

    LibraryStorage.addRecord(LibraryStorage.KEYS.issues, {
      issueId: data.issueId, memberId: member.memberId, memberName: member.fullName,
      bookId: book.bookId, bookName: book.bookName, issueDate: data.issueDate,
      expectedReturnDate: data.expectedReturnDate, actualReturnDate: '', status: 'Issued'
    });
    LibraryStorage.updateRecord(LibraryStorage.KEYS.books, 'bookId', book.bookId, { availableQuantity: Number(book.availableQuantity) - 1 });
    message.className = 'message success';
    message.textContent = `Book issued successfully with ID ${data.issueId}.`;
    libraryCommon.notify('Book issued successfully.');
    form.reset();
    document.getElementById('issueId').value = generateIssueId();
    document.getElementById('issueDate').value = today;
    populate();
    renderTable();
  });
});
