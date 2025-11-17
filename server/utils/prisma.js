const { PrismaClient } = require('@prisma/client')

let prismaClient

function getPrisma() {
	if (!prismaClient) {
		// 硬编码数据库 URL
		const databaseUrl = process.env.DATABASE_URL || 
			'postgresql://neondb_owner:npg_d2jCWZPFSgQ3@ep-red-wave-adt4e4cj-pooler.c-2.us-east-1.aws.neon.tech/agentedu?sslmode=require';
		
		prismaClient = new PrismaClient({
			datasources: {
				db: {
					url: databaseUrl
				}
			}
		})
	}
	return prismaClient
}

module.exports = { getPrisma }





