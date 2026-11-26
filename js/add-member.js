document.addEventListener('DOMContentLoaded', () => {
  if (!libraryCommon.initializeProtectedPage('members')) return;
  const form = document.getElementById('memberForm');
  const message = document.getElementById('memberMessage');
  const editId = new URLSearchParams(window.location.search).get('id');

  if (editId) {
    const member = LibraryStorage.findById(LibraryStorage.members(), 'memberId', editId);
    if (member) {
      document.getElementById('memberFormTitle').textContent = 'Edit Member';
      Object.entries(member).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
      document.getElementById('memberId').readOnly = true;
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    message.className = 'message';
    if (!data.memberId || !data.fullName || !data.department || !data.email || !data.mobile) {
      message.className = 'message error'; message.textContent = 'Please complete every field.'; return;
    }
    if (!libraryCommon.isValidEmail(data.email)) {
      message.className = 'message error'; message.textContent = 'Please enter a valid email address.'; return;
    }
    if (!/^\d{10}$/.test(data.mobile)) {
      message.className = 'message error'; message.textContent = 'Mobile number must contain exactly 10 digits.'; return;
    }
    if (!editId && LibraryStorage.findById(LibraryStorage.members(), 'memberId', data.memberId)) {
      message.className = 'message error'; message.textContent = 'Member ID already exists.'; return;
    }
    const record = { memberId: data.memberId.trim(), fullName: data.fullName.trim(), department: data.department.trim(), email: data.email.trim(), mobile: data.mobile.trim() };
    if (editId) {
      LibraryStorage.updateRecord(LibraryStorage.KEYS.members, 'memberId', editId, record);
      libraryCommon.notify('Member updated successfully.');
    } else {
      LibraryStorage.addRecord(LibraryStorage.KEYS.members, record);
      libraryCommon.notify('Member added successfully.');
    }
    setTimeout(() => window.location.href = 'members.html', 700);
  });
});
