import {
  PrismaClient,
  UserRole,
  OrganizationType,
  CourseDifficulty,
  CourseStatus,
  Gender,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: UserRole.LEARNER },
      update: {},
      create: { name: UserRole.LEARNER, description: 'Regular learner' },
    }),
    prisma.role.upsert({
      where: { name: UserRole.TEACHER },
      update: {},
      create: { name: UserRole.TEACHER, description: 'Educator or instructor' },
    }),
    prisma.role.upsert({
      where: { name: UserRole.HOSPITAL },
      update: {},
      create: { name: UserRole.HOSPITAL, description: 'Hospital organization' },
    }),
    prisma.role.upsert({
      where: { name: UserRole.NGO },
      update: {},
      create: { name: UserRole.NGO, description: 'Non-profit organization' },
    }),
    prisma.role.upsert({
      where: { name: UserRole.GOVERNMENT },
      update: {},
      create: { name: UserRole.GOVERNMENT, description: 'Government body' },
    }),
    prisma.role.upsert({
      where: { name: UserRole.ADMIN },
      update: {},
      create: { name: UserRole.ADMIN, description: 'Platform administrator' },
    }),
  ]);
  console.log(`Created ${roles.length} roles`);

  // Organizations
  const org1 = await prisma.organization.upsert({
    where: { id: 'org-indore-school' },
    update: {},
    create: {
      id: 'org-indore-school',
      name: 'Indore Deaf School',
      type: OrganizationType.SCHOOL,
      email: 'info@indoredeaf.edu',
      phone: '+91-731-2345678',
      city: 'Indore',
      state: 'Madhya Pradesh',
      country: 'India',
    },
  });
  const org2 = await prisma.organization.upsert({
    where: { id: 'org-mumbai-ngo' },
    update: {},
    create: {
      id: 'org-mumbai-ngo',
      name: 'Mumbai Ability Foundation',
      type: OrganizationType.NGO,
      email: 'contact@mumbaiability.org',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
  });
  console.log('Created organizations');

  // Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@signbridge.ai' },
      update: {},
      create: {
        email: 'admin@signbridge.ai',
        firebaseUid: 'firebase-admin-001',
        firstName: 'Admin',
        lastName: 'User',
        gender: Gender.PREFER_NOT_TO_SAY,
        country: 'India',
        state: 'Madhya Pradesh',
        city: 'Indore',
        isVerified: true,
        roleId: roles[5].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'priya@example.com' },
      update: {},
      create: {
        email: 'priya@example.com',
        firebaseUid: 'firebase-priya-001',
        firstName: 'Priya',
        lastName: 'Sharma',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('2000-05-15'),
        country: 'India',
        state: 'Madhya Pradesh',
        city: 'Indore',
        isVerified: true,
        roleId: roles[0].id,
        organizationId: org1.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'rahul@example.com' },
      update: {},
      create: {
        email: 'rahul@example.com',
        firebaseUid: 'firebase-rahul-001',
        firstName: 'Rahul',
        lastName: 'Verma',
        gender: Gender.MALE,
        dateOfBirth: new Date('1998-08-22'),
        country: 'India',
        state: 'Maharashtra',
        city: 'Mumbai',
        isVerified: true,
        roleId: roles[0].id,
        organizationId: org2.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'anjali@example.com' },
      update: {},
      create: {
        email: 'anjali@example.com',
        firebaseUid: 'firebase-anjali-001',
        firstName: 'Anjali',
        lastName: 'Patel',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1995-03-10'),
        country: 'India',
        state: 'Gujarat',
        city: 'Ahmedabad',
        isVerified: true,
        roleId: roles[1].id,
      },
    }),
  ]);
  console.log(`Created ${users.length} users`);

  // Sign Categories & Words
  const categories = await Promise.all([
    prisma.signCategory.upsert({
      where: { name: 'Greetings' },
      update: {},
      create: { name: 'Greetings', description: 'Common greetings in ISL', icon: '👋' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Numbers' },
      update: {},
      create: { name: 'Numbers', description: 'Number signs in ISL', icon: '🔢' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Daily Communication' },
      update: {},
      create: { name: 'Daily Communication', description: 'Everyday communication phrases', icon: '💬' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Emotions' },
      update: {},
      create: { name: 'Emotions', description: 'Expressing feelings and emotions', icon: '😊' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Family' },
      update: {},
      create: { name: 'Family', description: 'Family members and relationships', icon: '👨‍👩‍👧' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Food & Drink' },
      update: {},
      create: { name: 'Food & Drink', description: 'Food items and beverages', icon: '🍽️' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Alphabet' },
      update: {},
      create: { name: 'Alphabet', description: 'ISL manual alphabet letters', icon: '🔤' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Travel' },
      update: {},
      create: { name: 'Travel', description: 'Directions and travel-related signs', icon: '✈️' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Health' },
      update: {},
      create: { name: 'Health', description: 'Medical and health-related signs', icon: '🏥' },
    }),
    prisma.signCategory.upsert({
      where: { name: 'Colors' },
      update: {},
      create: { name: 'Colors', description: 'Color signs in ISL', icon: '🎨' },
    }),
  ]);
  console.log('Created sign categories');

  const allCategories = await prisma.signCategory.findMany();
  const catMap = Object.fromEntries(allCategories.map((c) => [c.name, c.id]));

  await Promise.all([
    // Greetings
    prisma.signWord.create({ data: { word: 'Hello', meaning: 'A common greeting', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Good Morning', meaning: 'Morning greeting', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Good Night', meaning: 'Night farewell', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Goodbye', meaning: 'Farewell gesture', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Welcome', meaning: 'Welcoming someone', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'How Are You', meaning: 'Asking about well-being', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Nice To Meet You', meaning: 'Polite introduction', categoryId: catMap['Greetings'], difficulty: 'BEGINNER' } }),
    // Numbers
    prisma.signWord.create({ data: { word: 'One', meaning: 'Number 1', categoryId: catMap['Numbers'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Two', meaning: 'Number 2', categoryId: catMap['Numbers'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Three', meaning: 'Number 3', categoryId: catMap['Numbers'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Four', meaning: 'Number 4', categoryId: catMap['Numbers'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Five', meaning: 'Number 5', categoryId: catMap['Numbers'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Ten', meaning: 'Number 10', categoryId: catMap['Numbers'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Hundred', meaning: 'Number 100', categoryId: catMap['Numbers'], difficulty: 'INTERMEDIATE' } }),
    // Daily Communication
    prisma.signWord.create({ data: { word: 'Yes', meaning: 'Affirmation', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'No', meaning: 'Negation', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Help', meaning: 'Requesting assistance', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Please', meaning: 'Polite request', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Thank You', meaning: 'Expression of gratitude', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Sorry', meaning: 'Apologizing', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'What', meaning: 'Asking what', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Where', meaning: 'Asking where', categoryId: catMap['Daily Communication'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'When', meaning: 'Asking when', categoryId: catMap['Daily Communication'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Why', meaning: 'Asking why', categoryId: catMap['Daily Communication'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Name', meaning: 'Asking someones name', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Water', meaning: 'Requesting water', categoryId: catMap['Daily Communication'], difficulty: 'BEGINNER' } }),
    // Emotions
    prisma.signWord.create({ data: { word: 'Happy', meaning: 'Feeling joy', categoryId: catMap['Emotions'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Sad', meaning: 'Feeling unhappy', categoryId: catMap['Emotions'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Angry', meaning: 'Feeling anger', categoryId: catMap['Emotions'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Scared', meaning: 'Feeling fear', categoryId: catMap['Emotions'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Surprised', meaning: 'Feeling surprise', categoryId: catMap['Emotions'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Love', meaning: 'Expressing love', categoryId: catMap['Emotions'], difficulty: 'BEGINNER' } }),
    // Family
    prisma.signWord.create({ data: { word: 'Mother', meaning: 'Mother or mom', categoryId: catMap['Family'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Father', meaning: 'Father or dad', categoryId: catMap['Family'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Brother', meaning: 'Male sibling', categoryId: catMap['Family'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Sister', meaning: 'Female sibling', categoryId: catMap['Family'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Child', meaning: 'Young person', categoryId: catMap['Family'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Grandfather', meaning: 'Father of parent', categoryId: catMap['Family'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Grandmother', meaning: 'Mother of parent', categoryId: catMap['Family'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Friend', meaning: 'Close companion', categoryId: catMap['Family'], difficulty: 'BEGINNER' } }),
    // Food & Drink
    prisma.signWord.create({ data: { word: 'Food', meaning: 'Eating food', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Tea', meaning: 'Cup of tea', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Milk', meaning: 'Glass of milk', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Bread', meaning: 'Loaf of bread', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Rice', meaning: 'Cooked rice', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Apple', meaning: 'Red fruit', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Banana', meaning: 'Yellow fruit', categoryId: catMap['Food & Drink'], difficulty: 'BEGINNER' } }),
    // Alphabet
    prisma.signWord.create({ data: { word: 'A', meaning: 'Letter A in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'B', meaning: 'Letter B in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'C', meaning: 'Letter C in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'D', meaning: 'Letter D in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'E', meaning: 'Letter E in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'F', meaning: 'Letter F in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'G', meaning: 'Letter G in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'H', meaning: 'Letter H in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'I', meaning: 'Letter I in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'J', meaning: 'Letter J in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'K', meaning: 'Letter K in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'L', meaning: 'Letter L in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'M', meaning: 'Letter M in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'N', meaning: 'Letter N in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'O', meaning: 'Letter O in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'P', meaning: 'Letter P in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Q', meaning: 'Letter Q in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'R', meaning: 'Letter R in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'S', meaning: 'Letter S in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'T', meaning: 'Letter T in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'U', meaning: 'Letter U in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'V', meaning: 'Letter V in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'W', meaning: 'Letter W in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'X', meaning: 'Letter X in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Y', meaning: 'Letter Y in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Z', meaning: 'Letter Z in ISL alphabet', categoryId: catMap['Alphabet'], difficulty: 'BEGINNER' } }),
    // Travel
    prisma.signWord.create({ data: { word: 'Airport', meaning: 'Place for flights', categoryId: catMap['Travel'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Bus', meaning: 'Public bus transport', categoryId: catMap['Travel'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Train', meaning: 'Railway transport', categoryId: catMap['Travel'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Hospital', meaning: 'Medical facility', categoryId: catMap['Travel'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'School', meaning: 'Educational institution', categoryId: catMap['Travel'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Home', meaning: 'Place of residence', categoryId: catMap['Travel'], difficulty: 'BEGINNER' } }),
    // Health
    prisma.signWord.create({ data: { word: 'Doctor', meaning: 'Medical professional', categoryId: catMap['Health'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Medicine', meaning: 'Taking medication', categoryId: catMap['Health'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Pain', meaning: 'Feeling physical pain', categoryId: catMap['Health'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Fever', meaning: 'Having fever', categoryId: catMap['Health'], difficulty: 'INTERMEDIATE' } }),
    prisma.signWord.create({ data: { word: 'Emergency', meaning: 'Urgent medical need', categoryId: catMap['Health'], difficulty: 'ADVANCED' } }),
    // Colors
    prisma.signWord.create({ data: { word: 'Red', meaning: 'Color red', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Blue', meaning: 'Color blue', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Green', meaning: 'Color green', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Yellow', meaning: 'Color yellow', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'White', meaning: 'Color white', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Black', meaning: 'Color black', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Orange', meaning: 'Color orange', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Purple', meaning: 'Color purple', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Pink', meaning: 'Color pink', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
    prisma.signWord.create({ data: { word: 'Brown', meaning: 'Color brown', categoryId: catMap['Colors'], difficulty: 'BEGINNER' } }),
  ]);
  console.log('Created sign words');

  // Courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'isl-basics' },
    update: {},
    create: {
      slug: 'isl-basics',
      title: 'Indian Sign Language Basics',
      description:
        'Learn the fundamentals of Indian Sign Language including alphabet, numbers, and basic conversation.',
      difficulty: CourseDifficulty.BEGINNER,
      estimatedDuration: 120,
      status: CourseStatus.PUBLISHED,
      createdBy: users[3].id,
    },
  });
  const course2 = await prisma.course.upsert({
    where: { slug: 'isl-daily-conversation' },
    update: {},
    create: {
      slug: 'isl-daily-conversation',
      title: 'Daily Conversation in ISL',
      description:
        'Master everyday conversations in Indian Sign Language for real-world interactions.',
      difficulty: CourseDifficulty.INTERMEDIATE,
      estimatedDuration: 180,
      status: CourseStatus.PUBLISHED,
      createdBy: users[3].id,
    },
  });
  console.log('Created courses');

  // Modules
  const module1 = await prisma.module.upsert({
    where: { id: 'module-isl-basics-intro' },
    update: {},
    create: {
      id: 'module-isl-basics-intro',
      title: 'Introduction to ISL',
      description: 'History and structure of Indian Sign Language',
      order: 1,
      courseId: course1.id,
    },
  });
  const module2 = await prisma.module.upsert({
    where: { id: 'module-isl-alphabet' },
    update: {},
    create: {
      id: 'module-isl-alphabet',
      title: 'ISL Alphabet',
      description: 'Learn the manual alphabet in ISL',
      order: 2,
      courseId: course1.id,
    },
  });
  const module3 = await prisma.module.upsert({
    where: { id: 'module-daily-greetings' },
    update: {},
    create: {
      id: 'module-daily-greetings',
      title: 'Greetings & Polite Phrases',
      description: 'Essential greetings and polite expressions',
      order: 1,
      courseId: course2.id,
    },
  });
  console.log('Created modules');

  // Lessons
  const lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'What is ISL?',
        description: 'Introduction to Indian Sign Language',
        order: 1,
        moduleId: module1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'ISL Grammar Basics',
        description: 'Basic grammatical structure of ISL',
        order: 2,
        moduleId: module1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Letters A-I',
        description: 'Manual alphabet part 1',
        order: 1,
        moduleId: module2.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Letters J-R',
        description: 'Manual alphabet part 2',
        order: 2,
        moduleId: module2.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Hello & Goodbye',
        description: 'Basic greetings',
        order: 1,
        moduleId: module3.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Please & Thank You',
        description: 'Polite expressions',
        order: 2,
        moduleId: module3.id,
      },
    }),
  ]);
  console.log(`Created ${lessons.length} lessons`);

  // Quiz
  const quiz1 = await prisma.quiz.upsert({
    where: { id: 'quiz-isl-basics-1' },
    update: {},
    create: {
      id: 'quiz-isl-basics-1',
      title: 'ISL Basics Quiz',
      description: 'Test your knowledge of ISL fundamentals',
      timeLimit: 10,
      passingScore: 70,
      courseId: course1.id,
    },
  });
  const question = await prisma.question.create({
    data: {
      text: 'What does the ISL sign for "Hello" typically involve?',
      order: 1,
      quizId: quiz1.id,
    },
  });
  await Promise.all([
    prisma.answerOption.create({
      data: {
        text: 'Open palm raised near face',
        isCorrect: true,
        order: 1,
        questionId: question.id,
      },
    }),
    prisma.answerOption.create({
      data: { text: 'Closed fist', isCorrect: false, order: 2, questionId: question.id },
    }),
    prisma.answerOption.create({
      data: { text: 'Waving both hands', isCorrect: false, order: 3, questionId: question.id },
    }),
  ]);
  console.log('Created quizzes');

  // User Progress
  await prisma.userProgress.create({
    data: {
      userId: users[1].id,
      lessonId: lessons[0].id,
      completed: true,
      completionDate: new Date(),
      watchTime: 120,
      accuracy: 0.92,
    },
  });
  await prisma.userProgress.create({
    data: { userId: users[1].id, lessonId: lessons[1].id, completed: false, watchTime: 60 },
  });
  await prisma.userProgress.create({
    data: {
      userId: users[2].id,
      lessonId: lessons[4].id,
      completed: true,
      completionDate: new Date(),
      watchTime: 90,
      accuracy: 0.88,
    },
  });
  console.log('Created user progress');

  // Practice Sessions
  const practice1 = await prisma.practiceSession.create({
    data: {
      userId: users[1].id,
      lessonId: lessons[2].id,
      confidenceScore: 0.89,
      accuracy: 0.85,
      feedback: 'Good hand positioning',
      duration: 300,
    },
  });
  await prisma.gesturePrediction.create({
    data: {
      practiceSessionId: practice1.id,
      predictedGesture: 'Letter A',
      confidence: 0.95,
      processingTime: 120.5,
    },
  });
  await prisma.gesturePrediction.create({
    data: {
      practiceSessionId: practice1.id,
      predictedGesture: 'Letter B',
      confidence: 0.88,
      processingTime: 115.2,
    },
  });
  console.log('Created practice sessions');

  // Favorites
  const signWords = await prisma.signWord.findMany();
  if (signWords.length > 0) {
    await prisma.favoriteSign.create({ data: { userId: users[1].id, signId: signWords[0].id } });
    await prisma.favoriteSign.create({ data: { userId: users[1].id, signId: signWords[1].id } });
  }
  console.log('Created favorites');

  // Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[1].id,
        title: 'Welcome!',
        message: 'Welcome to SignBridge AI',
        type: 'COURSE',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        title: 'Course Available',
        message: 'A new ISL course is available',
        type: 'COURSE',
      },
    }),
  ]);
  console.log('Created notifications');

  // System Settings
  await Promise.all([
    prisma.systemSetting.upsert({
      where: { key: 'max_upload_size_mb' },
      update: { value: '50' },
      create: {
        key: 'max_upload_size_mb',
        value: '50',
        description: 'Maximum file upload size in MB',
      },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'ai_model_version' },
      update: { value: 'v1.0' },
      create: { key: 'ai_model_version', value: 'v1.0', description: 'Current AI model version' },
    }),
  ]);
  console.log('Created system settings');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
