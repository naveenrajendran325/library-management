document.addEventListener('DOMContentLoaded', () => {
  const users = LibraryStorage.users();
  if (!users.some(user => user.username === 'admin')) {
    LibraryStorage.saveUsers([{
      fullName: 'System Administrator',
      username: 'admin',
      email: 'admin@library.edu',
      mobile: '0000000000',
      password: 'admin123'
    }, ...users]);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    document.getElementById('resetLogin')?.addEventListener('click', () => loginForm.reset());
    document.getElementById('togglePassword')?.addEventListener('click', event => {
      const password = document.getElementById('password');
      password.type = password.type === 'password' ? 'text' : 'password';
      event.currentTarget.innerHTML = password.type === 'password'
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
    });
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const error = document.getElementById('loginError');
      if (!username || !password) {
        error.textContent = 'Please enter both username and password.';
        return;
      }
      const user = LibraryStorage.users().find(item => item.username === username && item.password === password);
      if (!user) {
        error.textContent = 'Invalid username or password.';
        return;
      }
      sessionStorage.setItem('libraryActiveUser', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm));
      const error = document.getElementById('registerError');
      const success = document.getElementById('registerSuccess');
      error.textContent = '';
      success.textContent = '';
      if (!data.fullName || !data.username || !data.email || !data.mobile || !data.password || !data.confirmPassword) {
        error.textContent = 'Please complete every field.';
        return;
      }
      if (!libraryCommon.isValidEmail(data.email)) {
        error.textContent = 'Please enter a valid email address.';
        return;
      }
      if (!/^\d{10}$/.test(data.mobile)) {
        error.textContent = 'Mobile number must contain exactly 10 digits.';
        return;
      }
      if (data.password.length < 6) {
        error.textContent = 'Password must be at least 6 characters.';
        return;
      }
      if (data.password !== data.confirmPassword) {
        error.textContent = 'Passwords do not match.';
        return;
      }
      if (LibraryStorage.users().some(user => user.username.toLowerCase() === data.username.toLowerCase())) {
        error.textContent = 'This username is already registered.';
        return;
      }
      LibraryStorage.addRecord(LibraryStorage.KEYS.users, {
        fullName: data.fullName.trim(),
        username: data.username.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        password: data.password
      });
      success.textContent = 'Registration successful. Redirecting to login...';
      setTimeout(() => window.location.href = 'login.html', 900);
    });
  }
});
