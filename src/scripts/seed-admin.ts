import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if admin already exists
  const adminCount = await prisma.admin.count()
  
  if (adminCount > 0) {
    console.log('Admin already exists!')
    return
  }

  // Create default admin
  const passwordHash = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash,
      name: 'Administrator',
      email: 'admin@prediq.fun',
      role: 'SUPER_ADMIN',
    },
  })

  // Create a system user for markets
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@prediq.fun' }
  })
  
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@prediq.fun',
        name: 'System',
      },
    })
  }

  console.log('Admin created successfully!')
  console.log('Username:', admin.username)
  console.log('Password: admin123')
  console.log('Please change this password after first login!')

  // Create some sample events
  const now = new Date()
  const events = [
    {
      title: 'Eleições Presidenciais 2026',
      subtitle: 'Quem será o próximo presidente do Brasil?',
      description: 'Acompanhe as previsões para as eleições presidenciais de 2026',
      category: 'politics',
      startsAt: new Date('2026-10-01'),
      endsAt: new Date('2026-10-03'),
      featured: true,
      createdById: admin.id,
    },
    {
      title: 'Copa do Mundo 2026',
      subtitle: 'Brasil vence a Copa?',
      description: 'Previsões sobre o desempenho do Brasil na Copa do Mundo',
      category: 'sports',
      sport: 'soccer',
      startsAt: new Date('2026-06-01'),
      endsAt: new Date('2026-07-20'),
      featured: true,
      createdById: admin.id,
    },
    {
      title: 'Bitcoin em 2025',
      subtitle: 'BTC ultrapassa $100k?',
      description: 'Previsões sobre o preço do Bitcoin',
      category: 'crypto',
      startsAt: new Date('2025-01-01'),
      endsAt: new Date('2025-12-31'),
      featured: true,
      createdById: admin.id,
    },
    {
      title: 'Taxa Selic 2025',
      subtitle: 'Selic abaixo de 10%?',
      description: 'Previsões sobre a taxa Selic',
      category: 'economics',
      startsAt: new Date('2025-01-01'),
      endsAt: new Date('2025-12-31'),
      featured: false,
      createdById: admin.id,
    },
  ]

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: {
        ...eventData,
        status: eventData.startsAt > now ? 'UPCOMING' : 'LIVE',
      },
    })

    // Create markets for each event
    const markets = [
      {
        title: eventData.title + ' - Sim',
        description: 'Aposte se isso vai acontecer',
        category: eventData.category,
        closesAt: eventData.endsAt,
        createdById: systemUser.id,
        eventId: event.id,
      },
    ]

    for (const marketData of markets) {
      const market = await prisma.market.create({
        data: marketData,
      })

      // Create YES/NO outcomes
      await prisma.outcome.createMany({
        data: [
          {
            marketId: market.id,
            name: 'YES',
            probability: 0.5,
          },
          {
            marketId: market.id,
            name: 'NO',
            probability: 0.5,
          },
        ],
      })
    }
  }

  console.log('Sample events and markets created!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })