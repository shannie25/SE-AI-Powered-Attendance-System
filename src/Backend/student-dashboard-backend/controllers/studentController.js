const students = [
  { id: 1, name: 'Student A' },
  { id: 2, name: 'Student B' },
  { id: 3, name: 'Student C' },
  { id: 4, name: 'Student D' }
];

function getStudents() {
  return students;
}

function addStudent(name) {
  if (!name) return null;
  const newStudent = { id: students.length + 1, name };
  students.push(newStudent);
  return newStudent;
}

function findStudentById(id) {
  return students.find((s) => s.id === id);
}

module.exports = { 
    getStudents, 
    addStudent, 
    findStudentById 
};