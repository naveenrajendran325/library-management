document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('members')) return;
  const table = document.getElementById('membersTable');
  const search = document.getElementById('memberSearch');

  function render() {
    const term = search.value.trim().toLowerCase();
    const members = LibraryStorage.members().filter(member =>
      !term || [member.memberId, member.fullName, member.department].some(value => String(value).toLowerCase().includes(term))
    );
    table.innerHTML = members.length ? `
      <table><thead><tr><th>Member ID</th><th>Name</th><th>Department</th><th>Email</th><th>Mobile</th><th>Action</th></tr></thead>
      <tbody>${members.map(member => `<tr><td>${libraryCommon.escapeHtml(member.memberId)}</td><td><strong>${libraryCommon.escapeHtml(member.fullName)}</strong></td><td><span class="department-chip">${libraryCommon.escapeHtml(member.department)}</span></td><td>${libraryCommon.escapeHtml(member.email)}</td><td>${libraryCommon.escapeHtml(member.mobile)}</td><td><div class="action-buttons"><button class="icon-button" type="button" data-edit="${libraryCommon.escapeHtml(member.memberId)}" title="Edit">✎</button><button class="icon-button danger" type="button" data-delete="${libraryCommon.escapeHtml(member.memberId)}" title="Delete">×</button></div></td></tr>`).join('')}</tbody></table>` :
      '<div class="empty-state">No members match the current search.</div>';
  }
  search.addEventListener('input', render);
  document.getElementById('clearMemberSearch').addEventListener('click', () => { search.value = ''; render(); });
  table.addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) window.location.href = `add-member.html?id=${encodeURIComponent(edit.dataset.edit)}`;
    if (remove) {
      const memberId = remove.dataset.delete;
      if (LibraryStorage.issues().some(issue => issue.memberId === memberId && issue.status === 'Issued')) {
        return libraryCommon.notify('Cannot delete a member with active issued books.', 'error');
      }
      if (!confirm('Delete this member record?')) return;
      LibraryStorage.deleteRecord(LibraryStorage.KEYS.members, 'memberId', memberId);
      libraryCommon.notify('Member deleted successfully.');
      render();
    }
  });
  render();
});
