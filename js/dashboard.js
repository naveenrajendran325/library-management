document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('dashboard')) return;
  const books = LibraryStorage.books();
  const members = LibraryStorage.members();
  const issues = LibraryStorage.issues();
  const returned = issues.filter(issue => issue.status === 'Returned').length;

  document.getElementById('dashboardStats').innerHTML = [
    ['Total Books', books.length, '▤'],
    ['Total Members', members.length, '◎'],
    ['Books Issued', issues.filter(issue => issue.status === 'Issued').length, '⇄'],
    ['Books Returned', returned, '↩']
  ].map(([label, value, icon]) => `
    <article class="stat-card"><div><span>${label}</span><strong>${value}</strong></div><div class="stat-icon">${icon}</div></article>
  `).join('');

  const recentIssues = issues.slice(-5).reverse();
  document.getElementById('recentIssues').innerHTML = recentIssues.length ? `
    <table><thead><tr><th>Issue ID</th><th>Member</th><th>Book</th><th>Status</th></tr></thead>
    <tbody>${recentIssues.map(issue => `<tr><td>${libraryCommon.escapeHtml(issue.issueId)}</td><td>${libraryCommon.escapeHtml(issue.memberName)}</td><td>${libraryCommon.escapeHtml(issue.bookName)}</td><td><span class="badge ${issue.status === 'Returned' ? 'badge-returned' : 'badge-issued'}">${issue.status}</span></td></tr>`).join('')}</tbody></table>` :
    '<div class="empty-state">No issue records yet.</div>';

  const recentMembers = members.slice(-5).reverse();
  document.getElementById('recentMembers').innerHTML = recentMembers.length ? `
    <table><thead><tr><th>Member ID</th><th>Name</th><th>Department</th><th>Email</th></tr></thead>
    <tbody>${recentMembers.map(member => `<tr><td>${libraryCommon.escapeHtml(member.memberId)}</td><td>${libraryCommon.escapeHtml(member.fullName)}</td><td>${libraryCommon.escapeHtml(member.department)}</td><td>${libraryCommon.escapeHtml(member.email)}</td></tr>`).join('')}</tbody></table>` :
    '<div class="empty-state">No registered members yet.</div>';
});
