const { getPrisma } = require('./utils/prisma');
const prisma = getPrisma();

async function checkUsers() {
  const users = await prisma.user.findMany({ take: 3 });
  console.log('用户列表:');
  users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  await prisma.$disconnect();
}

checkUsers();
