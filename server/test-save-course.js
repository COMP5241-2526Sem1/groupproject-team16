// Test script to verify saved courses
const { getPrisma } = require('./utils/prisma');

async function checkSavedCourses() {
  const prisma = getPrisma();
  
  try {
    console.log('Checking saved courses...\n');
    
    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        teacher: true,
        homeworks: true,
        quizzes: true,
        resources: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });
    
    console.log(`Found ${courses.length} recent courses:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Teacher: ${course.teacher.name} (${course.teacher.email})`);
      console.log(`   Homeworks: ${course.homeworks.length}`);
      console.log(`   Quizzes: ${course.quizzes.length}`);
      console.log(`   Resources: ${course.resources.length}`);
      console.log(`   Created: ${course.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSavedCourses();
