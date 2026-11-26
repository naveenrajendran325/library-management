document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('reports')) return;
  const typeSelect = document.getElementById('reportType');
  const search = document.getElementById('reportSearch');
  const table = document.getElementById('reportTable');

  function render() {
    const books = LibraryStorage.books();
    const members = LibraryStorage.members();
    const issues = LibraryStorage.issues();
    const stats = [
      ['Total Books', books.length],
      ['Total Members', members.length],
      ['Available Books', books.reduce((sum, book) => sum + Number(book.availableQuantity), 0)],
      ['Issued Books', issues.filter(issue => issue.status === 'Issued').length],
      ['Returned Books', issues.filter(issue => issue.status === 'Returned').length]
    ];
    document.getElementById('reportStats').innerHTML = stats.map(([label, value]) => `<article class="report-stat"><span>${label}</span><strong>${value}</strong></article>`).join('');

    const term = search.value.trim().toLowerCase();
    const type = typeSelect.value;
    let headings = [];
    let rows = [];
    if (type === 'books') {
      headings = ['Book ID','Book Name','Author','Category','Quantity','Available'];
      rows = books.filter(book => !term || Object.values(book).join(' ').toLowerCase().includes(term)).map(book => [book.bookId,book.bookName,book.author,book.category,book.quantity,book.availableQuantity]);
    } else if (type === 'members') {
      headings = ['Member ID','Name','Department','Email','Mobile'];
      rows = members.filter(member => !term || Object.values(member).join(' ').toLowerCase().includes(term)).map(member => [member.memberId,member.fullName,member.department,member.email,member.mobile]);
    } else if (type === 'issued' || type === 'returned') {
      const status = type === 'issued' ? 'Issued' : 'Returned';
      headings = ['Issue ID','Member Name','Book Name','Issue Date','Return Date','Status'];
      rows = issues.filter(issue => issue.status === status).filter(issue => !term || Object.values(issue).join(' ').toLowerCase().includes(term)).map(issue => [issue.issueId,issue.memberName,issue.bookName,issue.issueDate,issue.actualReturnDate || '-',issue.status]);
    } else {
      headings = ['Record Type','Record ID','Name','Details','Status'];
      const bookRows = books.map(book => ['Book',book.bookId,book.bookName,`${book.author} | ${book.category}`,`${book.availableQuantity}/${book.quantity} available`]);
      const memberRows = members.map(member => ['Member',member.memberId,member.fullName,`${member.department} | ${member.email}`,member.mobile]);
      const issueRows = issues.map(issue => ['Issue',issue.issueId,issue.memberName,issue.bookName,issue.status]);
      rows = [...bookRows, ...memberRows, ...issueRows].filter(row => !term || row.join(' ').toLowerCase().includes(term));
    }
    document.getElementById('reportTitle').textContent = typeSelect.options[typeSelect.selectedIndex].text;
    table.innerHTML = rows.length ?
      `<table><thead><tr>${headings.map(heading => `<th>${heading}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${libraryCommon.escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>` :
      '<div class="empty-state">No records match this report filter.</div>';
  }

  typeSelect.addEventListener('change', render);
  search.addEventListener('input', render);
  document.getElementById('printReport').addEventListener('click', () => window.print());
  document.getElementById('exportCsv').addEventListener('click', () => {
    const tableElement = table.querySelector('table');
    if (!tableElement) return libraryCommon.notify('No report data to export.', 'error');
    const csv = [...tableElement.querySelectorAll('tr')].map(row =>
      [...row.children].map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `library-report-${new Date().toISOString().slice(0,10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  });
  render();
});
