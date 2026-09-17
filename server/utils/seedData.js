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
    'What does a senior engineer call explaining an impossible bug to a small yellow rubber bathtub toy for 3 hours until realizing a missing semicolon?',
    'In JavaScript, what does [] + [] evaluate to, and what hilarious monstrosity does [] + {} output?',
    'Why do programmers always confuse Halloween (OCT 31) with Christmas (DEC 25)?',
    'What is the only valid number in JavaScript defined as Not a Number, yet typeof NaN proudly claims it is a number?',
    'I have keys but no locks, space but no room, you can enter but you can never leave. Every programmer pounds me when their code crashes. What am I?',
    'Why do Java developers wear thick glasses?',
    'A CSS file walks into a bar. Why does the bartender immediately collapse onto a completely different floor?',
    'If you type "google.com" into Google, what happens according to IT Crowd legend?',
    'There are 10 types of people in the world. Who are they?',
    'What is the universal developer excuse when code works on your laptop but crashes in production?'
  ],
  blaze: [
    'A programmer\'s wife says: "Go to the store and buy 1 loaf of bread. If they have eggs, buy 10." He returns with 10 loaves of bread. What logical syntax flaw did he execute?',
    'In Python and JavaScript, why does 0.1 + 0.2 === 0.3 evaluate to FALSE?',
    'What happens when you run "git push origin master --force" on a shared repository at 4:59 PM on a Friday?',
    'In JavaScript, what is the output of (\'b\' + \'a\' + + \'a\' + \'a\').toLowerCase()?',
    'Why does Math.max() return -Infinity while Math.min() returns Infinity in JavaScript?',
    'You need to sort an array. Your colleague writes an O((n+1)!) algorithm that shuffles until lucky. The heat death of the universe arrives first. What algorithm is this?',
    'What SQL query does every hacker whisper when attempting classic SQL injection on a login form?',
    'In Git, what is a "detached HEAD" state? Did somebody get decapitated in the terminal?',
    'Why does true + true === 2 and true - false === 1 in JavaScript?',
    'What does the HTTP 418 status code officially declare according to RFC 2324?'
  ],
  savage: [
    'CSS Nightmare: You applied margin: 0 auto; on a <span> element inside a flex container and nothing centered. Why is CSS mocking you, and what property must you add?',
    'A developer accidentally pushed their .env containing AWS root keys to a public GitHub repo. 3 minutes later, what automated bot phenomenon occurs?',
    'Look at this loop: for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 1000); } - What prints after 1 second, and why did var betray you?',
    'Why does JSON.stringify({ a: undefined, b: () => {}, c: NaN }) return "{\\"c\\":null}"? Where did a and b disappear to?',
    'What is the notorious "z-index: 99999999" trap, and why did the modal still render behind the navbar?',
    'In C/C++, you allocate memory with malloc(1024) inside an infinite game loop and forget free(). What silent OS assassin terminates your RAM?',
    'Two threads need Resource A and Resource B. Thread 1 locks A and waits for B. Thread 2 locks B and waits for A. Neither ever moves. What deadly romantic tragedy occurred?',
    'What does "sudo chmod 777 -R /" do to a Linux server, and why will the sysadmin show up at your desk holding a baseball bat?',
    'In MongoDB, what catastrophic thing happens if you execute db.users.remove({}) without arguments in older versions?',
    'Why does [] == ![] evaluate to TRUE in JavaScript? Explain the sorcery!'
  ],
  brutal: [
    'Deploying to production at 5:00 PM on Friday: What architectural safety net should have prevented the server explosion?',
    'According to the CAP theorem in distributed systems, a network partition occurs (P). A bank ATM chooses A over C. What hilarious chaos could occur?',
    'What is the infamous "Thundering Herd" (or Cache Stampede) problem, and how does a single Redis TTL expiration bring down a million-user database?',
    'Explain the difference between a Process and a Thread using a restaurant analogy where the kitchen catches fire.',
    'In Git, what is the life-saving command that rescues commits you accidentally deleted via a bad git reset --hard?',
    'Why does 2038-01-19 03:14:07 UTC keep senior UNIX engineers awake at night? (The Year 2038 Problem)',
    'What happens in TCP when the client sends SYN, server sends SYN-ACK, but the client never sends ACK? What cyberattack is this?',
    'In React, why is using key={index} on a dynamically re-orderable list considered a performance and visual abomination?',
    'What is a "Race Condition", and what software concurrency mechanism uses a key/flag to prevent two threads from entering the critical section?',
    'What is DNS Cache Poisoning, and why did visiting your university portal suddenly redirect you to a scam website in Russia?'
  ],
  legendary: [
    'The Infinite Loop of Doom: Look at this code: while(1) { fork(); } — What mythological self-replicating weapon/creature is this attack named after?',
    'What is the "Byzantine Generals Problem", and how did Satoshi Nakamoto solve it in 2008 without needing a central general?',
    'Alan Turing proved in 1936 that no computer program can determine whether an arbitrary program will finish running or run forever. What is this famous theorem called?',
    'In 1999, NASA lost the $125M Mars Climate Orbiter because one team used Metric Newtons and Lockheed used Imperial Pound-force. What software principle was violated?',
    'What is the Dining Philosophers Problem, and how do five thinkers starve to death while holding only one chopstick each?',
    'What is the "Travelling Salesperson Problem" (TSP), what complexity class does it belong to, and why will an optimal polynomial solution earn you $1,000,000?',
    'What happened on July 19, 2024 when a single NULL pointer dereference in a CrowdStrike kernel driver (csagent.sys) crashed 8.5 million Windows computers with BSOD?',
    'Why does Quicksort degrade to O(n²) worst-case time complexity, and how does "Median-of-Three" or Randomized pivot selection prevent the nightmare?',
    'What are Meltdown and Spectre, and how did CPU hardware "Speculative Execution" accidentally leak passwords across secure kernel memory boundaries?',
    'If you had to design a live leaderboard for 10 million concurrent participants updating scores every millisecond, what in-memory data structure (used by Redis) gives O(log N) inserts and score ranking?'
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
    password: 'Admin2026#',
    role: 'admin'
  });
  console.log('✅ Admin seeded (admin / Admin2026#)');

  // 2. Create Scorer
  await User.create({
    username: 'scorer',
    password: 'scorer2026#',
    role: 'scorer'
  });
  console.log('✅ Scorer seeded (scorer / scorer2026#)');

  // 3. Create Questions
  let questionCount = 0;
  for (const diff of DIFFICULTIES) {
    const questions = SAMPLE_QUESTIONS[diff.key];
    for (let i = 0; i < 10; i++) {
      const qNum = i + 1;
      const qIdLower = `${diff.prefix}${qNum}`.toLowerCase();
      await Question.create({
        questionNumber: qNum,
        difficulty: diff.key,
        questionId: `${diff.prefix}${qNum}`,
        questionText: questions[i],
        imageUrl: `/questions/${qIdLower}.jpg`,
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

