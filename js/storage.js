const LibraryStorage = {
  KEYS: {
    users: 'libraryUsers',
    books: 'libraryBooks',
    members: 'libraryMembers',
    issues: 'libraryIssues'
  },

  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
      console.error(`Could not read ${key}`, error);
      return [];
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  users() { return this.get(this.KEYS.users); },
  saveUsers(users) { this.set(this.KEYS.users, users); },
  books() { return this.get(this.KEYS.books); },
  saveBooks(books) { this.set(this.KEYS.books, books); },
  members() { return this.get(this.KEYS.members); },
  saveMembers(members) { this.set(this.KEYS.members, members); },
  issues() { return this.get(this.KEYS.issues); },
  saveIssues(issues) { this.set(this.KEYS.issues, issues); },

  findById(collection, idField, id) {
    return collection.find(item => String(item[idField]).toLowerCase() === String(id).toLowerCase());
  },

  addRecord(key, record) {
    const records = this.get(key);
    records.push(record);
    this.set(key, records);
    return record;
  },

  updateRecord(key, idField, id, updates) {
    const records = this.get(key);
    const index = records.findIndex(item => String(item[idField]).toLowerCase() === String(id).toLowerCase());
    if (index === -1) return null;
    records[index] = { ...records[index], ...updates };
    this.set(key, records);
    return records[index];
  },

  deleteRecord(key, idField, id) {
    const records = this.get(key);
    const filtered = records.filter(item => String(item[idField]).toLowerCase() !== String(id).toLowerCase());
    this.set(key, filtered);
  }
};
