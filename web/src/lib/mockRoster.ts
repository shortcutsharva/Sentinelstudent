import type { Student } from './types'

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kabir', 'Meera', 'Neha', 'Rohan',
  'Sana', 'Vihaan', 'Zara', 'Dev', 'Kavya', 'Rehan', 'Tara', 'Mihir', 'Nisha', 'Yash',
]
const LAST_NAMES = [
  'Sharma', 'Patel', 'Rao', 'Mehta', 'Iyer', 'Kapoor', 'Nair', 'Khan', 'Desai', 'Joshi',
  'Malhotra', 'Sen', 'Bose', 'Reddy', 'Chatterjee', 'Menon', 'Kulkarni', 'Saxena', 'Bhat', 'Verma',
]
const MENTOR_NAMES = ['Ms. Rao', 'Mr. Mehta', 'Ms. Iyer', 'Mr. Khan', 'Ms. Nair', 'Mr. Sen']
const PARENT_NAMES = ['Anita Sharma', 'Vikram Patel', 'Sunita Mehta', 'Rajesh Iyer', 'Farah Khan', 'Deepak Nair']

function hash(value: string): number {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

export function fictionalStudentName(id: string): string {
  const seed = hash(id)
  const first = FIRST_NAMES[seed % FIRST_NAMES.length]
  const last = LAST_NAMES[(seed >>> 8) % LAST_NAMES.length]
  return `${first} ${last}`
}

export function enrichStudentRoster(students: Student[]): Student[] {
  return students.map((student) => {
    const seed = hash(student.id)
    return {
      ...student,
      name: student.name ?? fictionalStudentName(student.id),
      mentorName: student.mentorName ?? MENTOR_NAMES[(seed >>> 16) % MENTOR_NAMES.length],
      parentName: student.parentName ?? PARENT_NAMES[(seed >>> 20) % PARENT_NAMES.length],
    }
  })
}
