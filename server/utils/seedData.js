const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Participant = require('../models/Participant');
const Question = require('../models/Question');
const Score = require('../models/Score');
const Event = require('../models/Event');

const DIFFICULTIES = [
  { key: 'chill', prefix: 'C', defaultPoints: 5 },
  { key: 'blaze', prefix: 'B', defaultPoints: 10 },
  { key: 'savage', prefix: 'SV', defaultPoints: 15 },
  { key: 'brutal', prefix: 'BR', defaultPoints: 20 },
  { key: 'legendary', prefix: 'L', defaultPoints: 25 }
];

const SAMPLE_QUESTIONS = {
  chill: [
    'What does HTML stand for?',
    'What is the output of: console.log(typeof null)?',
    'Which tag is used to create a hyperlink in HTML?',
    'What does CSS stand for?',
    'How do you declare a variable in JavaScript?',
    'What is the file extension for a Python file?',
    'Which symbol is used for comments in Python?',
    'What does API stand for?',
    'What is the default port for HTTP?',
    'Which company developed React.js?'
  ],
  blaze: [
    'What is the difference between == and === in JavaScript?',
    'What is a closure in JavaScript?',
    'What does the "this" keyword refer to in JavaScript?',
    'What is the purpose of a package.json file?',
    'What is the difference between let and var?',
    'What is an arrow function in JavaScript?',
    'What is the purpose of the useEffect hook in React?',
    'What does REST stand for?',
    'What is JSON?',
    'What is the purpose of Git?'
  ],
  savage: [
    'Explain the event loop in JavaScript.',
    'What is the difference between SQL and NoSQL databases?',
    'What is middleware in Express.js?',
    'Explain the concept of promises in JavaScript.',
    'What is the Virtual DOM in React?',
    'What is the purpose of JWT tokens?',
    'Explain the MVC architecture pattern.',
    'What is the difference between TCP and UDP?',
    'What is CORS and why is it needed?',
    'Explain the concept of hoisting in JavaScript.'
  ],
  brutal: [
    'What is the time complexity of quicksort?',
    'Explain the CAP theorem in distributed systems.',
    'What is a race condition? How do you prevent it?',
    'Explain how garbage collection works in JavaScript.',
    'What is the difference between process and thread?',
    'What is a WebSocket? How does it differ from HTTP?',
    'Explain the concept of database indexing.',
    'What is a memory leak and how do you detect one?',
    'Explain the SOLID principles in OOP.',
    'What is the difference between horizontal and vertical scaling?'
  ],
  legendary: [
    'Design a URL shortener system. What components would you need?',
    'Explain how a blockchain works at a technical level.',
    'How would you design a real-time chat system for millions of users?',
    'Explain the concept of eventual consistency in distributed databases.',
    'What is the Byzantine Generals Problem?',
    'How does the V8 engine optimize JavaScript execution?',
    'Design a rate limiter for an API. Explain your approach.',
    'What is the difference between symmetric and asymmetric encryption?',
    'Explain how DNS resolution works step by step.',
    'How would you design a live leaderboard system that scales to millions?'
  ]
};


async function seedData() {
  // Clear existing data
  await User.deleteMany({});
  await Participant.deleteMany({});
  await Question.deleteMany({});
  await Score.deleteMany({});
  await Event.deleteMany({});

  // 1. Create Admin
  await User.create({
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  });
  console.log('✅ Admin seeded (admin / admin123)');

  // 2. Create Scorer
  await User.create({
    username: 'scorer',
    password: 'scorer123',
    role: 'scorer'
  });
  console.log('✅ Scorer seeded (scorer / scorer123)');

  // 3. Create Questions
  let questionCount = 0;
  for (const diff of DIFFICULTIES) {
    const questions = SAMPLE_QUESTIONS[diff.key];
    for (let i = 0; i < 10; i++) {
      await Question.create({
        questionNumber: i + 1,
        difficulty: diff.key,
        questionId: `${diff.prefix}${i + 1}`,
        questionText: questions[i],
        points: diff.defaultPoints,
        status: 'available'
      });
      questionCount++;
    }
  }
  console.log(`✅ ${questionCount} questions created across 5 difficulty tiers`);

  // 4. Create Event
  await Event.create({ status: 'waiting', name: 'FunBuzz Event' });
  console.log('✅ Event initialized (status: waiting)');
}

module.exports = seedData;

