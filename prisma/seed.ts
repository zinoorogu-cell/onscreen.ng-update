import { PrismaClient, UserRole, TimeOfDay, DayType, CampaignStatus, QuoteStatus, RFQStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Onscreen.ng database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@onscreen.ng' },
    update: {},
    create: {
      name: 'Onscreen Admin',
      email: 'admin@onscreen.ng',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
      company: 'Onscreen.ng',
    },
  })

  // Create demo advertiser
  const advertiserPassword = await bcrypt.hash('Demo@123!', 12)
  const advertiser = await prisma.user.upsert({
    where: { email: 'brand@example.com' },
    update: {},
    create: {
      name: 'Demo Brand Manager',
      email: 'brand@example.com',
      password: advertiserPassword,
      role: UserRole.ADVERTISER,
      isVerified: true,
      company: 'Dangote Industries',
      phone: '+2348012345678',
    },
  })

  // Create media owner
  const mediaOwnerPassword = await bcrypt.hash('Media@123!', 12)
  const mediaOwnerUser = await prisma.user.upsert({
    where: { email: 'owner@silverbird.com' },
    update: {},
    create: {
      name: 'Silverbird Media',
      email: 'owner@silverbird.com',
      password: mediaOwnerPassword,
      role: UserRole.MEDIA_OWNER,
      isVerified: true,
      company: 'Silverbird Cinemas',
    },
  })

  const mediaOwner = await prisma.mediaOwner.upsert({
    where: { userId: mediaOwnerUser.id },
    update: {},
    create: {
      userId: mediaOwnerUser.id,
      companyName: 'Silverbird Group',
      rcNumber: 'RC123456',
      isVerified: true,
    },
  })

  // Cinemas data
  const cinemasData = [
    {
      name: 'Silverbird Galleria',
      city: 'Lagos',
      state: 'Lagos',
      address: 'Ahmadu Bello Way, Victoria Island, Lagos',
      description: 'Premium multiplex cinema in the heart of Victoria Island',
      isActive: true,
      isApproved: true,
      mediaOwnerId: mediaOwner.id,
      screens: [
        { name: 'Screen 1 (IMAX)', seatingCapacity: 300, showtimesPerDay: 5, basePrice: 150000 },
        { name: 'Screen 2 (Standard)', seatingCapacity: 200, showtimesPerDay: 6, basePrice: 80000 },
        { name: 'Screen 3 (VIP)', seatingCapacity: 80, showtimesPerDay: 4, basePrice: 120000 },
      ]
    },
    {
      name: 'Genesis Cinemas (Lekki)',
      city: 'Lagos',
      state: 'Lagos',
      address: 'Lekki Phase 1, Lagos',
      description: 'Modern cinema experience in the upscale Lekki neighbourhood',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Main Hall', seatingCapacity: 250, showtimesPerDay: 6, basePrice: 100000 },
        { name: 'Premium Lounge', seatingCapacity: 100, showtimesPerDay: 4, basePrice: 130000 },
      ]
    },
    {
      name: 'Filmhouse Cinema (Surulere)',
      city: 'Lagos',
      state: 'Lagos',
      address: 'Adeniran Ogunsanya Mall, Surulere, Lagos',
      description: 'Cinema in the vibrant Surulere commercial district',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Screen A', seatingCapacity: 220, showtimesPerDay: 5, basePrice: 75000 },
        { name: 'Screen B', seatingCapacity: 180, showtimesPerDay: 5, basePrice: 65000 },
        { name: 'Screen C (3D)', seatingCapacity: 150, showtimesPerDay: 4, basePrice: 90000 },
      ]
    },
    {
      name: 'Ozone Cinemas Yaba',
      city: 'Lagos',
      state: 'Lagos',
      address: 'Circle Mall, Yaba, Lagos',
      description: 'Popular cinema serving the tech and student hub of Yaba',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Main Screen', seatingCapacity: 200, showtimesPerDay: 6, basePrice: 70000 },
        { name: 'Mini Screen', seatingCapacity: 100, showtimesPerDay: 5, basePrice: 45000 },
      ]
    },
    {
      name: 'Silverbird Cinema Abuja',
      city: 'Abuja',
      state: 'FCT',
      address: 'Central Business District, Abuja',
      description: 'Flagship cinema in the Federal Capital Territory',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Screen 1 (IMAX)', seatingCapacity: 280, showtimesPerDay: 5, basePrice: 140000 },
        { name: 'Screen 2', seatingCapacity: 200, showtimesPerDay: 6, basePrice: 80000 },
        { name: 'Screen 3 (VIP)', seatingCapacity: 80, showtimesPerDay: 4, basePrice: 110000 },
      ]
    },
    {
      name: 'Genesis Cinemas Abuja',
      city: 'Abuja',
      state: 'FCT',
      address: 'Jabi Lake Mall, Abuja',
      description: 'Premium cinema experience at Jabi Lake Mall',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Hall 1', seatingCapacity: 240, showtimesPerDay: 5, basePrice: 95000 },
        { name: 'Hall 2 (Deluxe)', seatingCapacity: 120, showtimesPerDay: 4, basePrice: 120000 },
      ]
    },
    {
      name: 'Filmhouse Cinema PH',
      city: 'Port Harcourt',
      state: 'Rivers',
      address: 'GRA Phase 2, Port Harcourt',
      description: 'Leading cinema in Port Harcourt\'s Government Reserved Area',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Screen 1', seatingCapacity: 200, showtimesPerDay: 5, basePrice: 70000 },
        { name: 'Screen 2', seatingCapacity: 160, showtimesPerDay: 5, basePrice: 60000 },
      ]
    },
    {
      name: 'Silverbird Cinemas Kano',
      city: 'Kano',
      state: 'Kano',
      address: 'Kano City Mall, Kano',
      description: 'Modern cinema serving Northern Nigeria\'s largest city',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Main Hall', seatingCapacity: 220, showtimesPerDay: 4, basePrice: 65000 },
        { name: 'Standard Hall', seatingCapacity: 150, showtimesPerDay: 4, basePrice: 45000 },
      ]
    },
    {
      name: 'Genesis Cinemas Ibadan',
      city: 'Ibadan',
      state: 'Oyo',
      address: 'Cocoa Mall, Ibadan',
      description: 'Premium cinema in Ibadan\'s commercial district',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Hall 1', seatingCapacity: 200, showtimesPerDay: 5, basePrice: 60000 },
        { name: 'Hall 2', seatingCapacity: 150, showtimesPerDay: 5, basePrice: 50000 },
      ]
    },
    {
      name: 'Nairobi Cinema Hub',
      city: 'Nairobi',
      state: 'Nairobi County',
      address: 'Westgate Mall, Westlands, Nairobi',
      description: 'Premium cinema in Kenya\'s capital city',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Main Screen', seatingCapacity: 260, showtimesPerDay: 5, basePrice: 120000 },
        { name: 'VIP Lounge', seatingCapacity: 80, showtimesPerDay: 4, basePrice: 150000 },
      ]
    },
    {
      name: 'Accra Premium Cinema',
      city: 'Accra',
      state: 'Greater Accra',
      address: 'Accra Mall, Tetteh Quarshie, Accra',
      description: 'Leading multiplex cinema in Ghana\'s capital',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Screen 1', seatingCapacity: 240, showtimesPerDay: 5, basePrice: 110000 },
        { name: 'Screen 2', seatingCapacity: 180, showtimesPerDay: 5, basePrice: 85000 },
      ]
    },
    {
      name: 'Filmhouse Cinema Enugu',
      city: 'Enugu',
      state: 'Enugu',
      address: 'Polo Park Mall, Enugu',
      description: 'Premium cinema experience in Enugu State',
      isActive: true,
      isApproved: true,
      screens: [
        { name: 'Main Hall', seatingCapacity: 180, showtimesPerDay: 4, basePrice: 55000 },
        { name: 'Standard', seatingCapacity: 130, showtimesPerDay: 4, basePrice: 40000 },
      ]
    },
  ]

  const occupancyProfiles = [
    // Weekday profiles
    { timeOfDay: TimeOfDay.MORNING, dayType: DayType.WEEKDAY, occupancyRate: 0.20 },
    { timeOfDay: TimeOfDay.AFTERNOON, dayType: DayType.WEEKDAY, occupancyRate: 0.35 },
    { timeOfDay: TimeOfDay.EVENING, dayType: DayType.WEEKDAY, occupancyRate: 0.65 },
    { timeOfDay: TimeOfDay.ALL_DAY, dayType: DayType.WEEKDAY, occupancyRate: 0.40 },
    // Weekend profiles
    { timeOfDay: TimeOfDay.MORNING, dayType: DayType.WEEKEND, occupancyRate: 0.40 },
    { timeOfDay: TimeOfDay.AFTERNOON, dayType: DayType.WEEKEND, occupancyRate: 0.70 },
    { timeOfDay: TimeOfDay.EVENING, dayType: DayType.WEEKEND, occupancyRate: 0.90 },
    { timeOfDay: TimeOfDay.ALL_DAY, dayType: DayType.WEEKEND, occupancyRate: 0.67 },
    // Holiday profiles
    { timeOfDay: TimeOfDay.MORNING, dayType: DayType.HOLIDAY, occupancyRate: 0.55 },
    { timeOfDay: TimeOfDay.AFTERNOON, dayType: DayType.HOLIDAY, occupancyRate: 0.85 },
    { timeOfDay: TimeOfDay.EVENING, dayType: DayType.HOLIDAY, occupancyRate: 0.95 },
    { timeOfDay: TimeOfDay.ALL_DAY, dayType: DayType.HOLIDAY, occupancyRate: 0.78 },
    // Festive profiles
    { timeOfDay: TimeOfDay.MORNING, dayType: DayType.FESTIVE, occupancyRate: 0.70 },
    { timeOfDay: TimeOfDay.AFTERNOON, dayType: DayType.FESTIVE, occupancyRate: 0.95 },
    { timeOfDay: TimeOfDay.EVENING, dayType: DayType.FESTIVE, occupancyRate: 0.99 },
    { timeOfDay: TimeOfDay.ALL_DAY, dayType: DayType.FESTIVE, occupancyRate: 0.88 },
  ]

  for (const cinemaData of cinemasData) {
    const { screens, ...cinema } = cinemaData
    const createdCinema = await prisma.cinema.upsert({
      where: { id: `cinema-${cinema.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `cinema-${cinema.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...cinema,
      },
    })

    for (const screenData of screens) {
      const screen = await prisma.screen.create({
        data: {
          cinemaId: createdCinema.id,
          ...screenData,
        },
      })

      for (const profile of occupancyProfiles) {
        await prisma.occupancyProfile.upsert({
          where: {
            screenId_timeOfDay_dayType: {
              screenId: screen.id,
              timeOfDay: profile.timeOfDay,
              dayType: profile.dayType,
            },
          },
          update: {},
          create: {
            screenId: screen.id,
            ...profile,
          },
        })
      }
    }
  }

  // Create a demo campaign
  const rfq = await prisma.rFQ.create({
    data: {
      userId: advertiser.id,
      campaignName: 'Dangote Cement 2025 Campaign',
      brandName: 'Dangote Industries',
      contactEmail: 'brand@example.com',
      phone: '+2348012345678',
      durationStart: new Date('2025-02-01'),
      durationEnd: new Date('2025-02-28'),
      targetCities: ['Lagos', 'Abuja'],
      status: RFQStatus.ACCEPTED,
    },
  })

  const quote = await prisma.quote.create({
    data: {
      rfqId: rfq.id,
      totalMediaCost: 2000000,
      agencyFee: 200000,
      vatAmount: 165000,
      conversionFee: 20000,
      grandTotal: 2385000,
      status: QuoteStatus.ACCEPTED,
      validUntil: new Date('2025-01-31'),
    },
  })

  const campaign = await prisma.campaign.create({
    data: {
      userId: advertiser.id,
      quoteId: quote.id,
      name: 'Dangote Cement 2025 Campaign',
      status: CampaignStatus.COMPLETED,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-28'),
      totalImpressions: 485000,
      totalPlays: 1260,
    },
  })

  // Add impression logs for the demo campaign
  const startDate = new Date('2025-02-01')
  for (let i = 0; i < 28; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const impressions = isWeekend ? Math.floor(Math.random() * 5000 + 18000) : Math.floor(Math.random() * 4000 + 12000)
    await prisma.impressionLog.create({
      data: {
        campaignId: campaign.id,
        date,
        impressions,
        plays: Math.floor(impressions / 380),
        location: 'Lagos',
      },
    })
  }

  // ─── SEED FILMS ────────────────────────────────────────────────────
  console.log('🎬 Seeding films...')

  const filmsData = [
    // NOW SHOWING — NOLLYWOOD
    {
      title: 'A Tribe Called Judah',
      category: 'NOLLYWOOD', status: 'NOW_SHOWING',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/9/90/A_Tribe_Called_Judah_film_poster.jpg',
      genre: 'Crime Drama', rating: '15', durationMins: 133,
      director: 'Funke Akindele',
      synopsis: 'A single mother raises her sons in a Lagos slum where survival means navigating crime and loyalty.',
      audienceGender: 'MIXED', audienceAge: 'YOUNG_ADULTS',
      releaseDate: new Date('2023-12-22'), isFeatured: true, sortOrder: 1,
    },
    {
      title: 'Mufasa: The Lion King',
      category: 'ANIMATION', status: 'NOW_SHOWING',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Mufasa-_The_Lion_King_poster.jpg/220px-Mufasa-_The_Lion_King_poster.jpg',
      genre: 'Animation / Adventure', rating: 'PG', durationMins: 118,
      director: 'Barry Jenkins',
      synopsis: 'The origin story of Mufasa, the legendary Lion King, told through generations.',
      audienceGender: 'MIXED', audienceAge: 'CHILDREN',
      releaseDate: new Date('2024-12-20'), isFeatured: true, sortOrder: 2,
    },
    {
      title: 'Everybody Loves Jenifa',
      category: 'NOLLYWOOD', status: 'NOW_SHOWING',
      posterUrl: null,
      genre: 'Comedy', rating: 'PG', durationMins: 110,
      director: 'Funke Akindele',
      synopsis: 'Jenifa is back — navigating fame, family, and the chaos of Lagos high society.',
      audienceGender: 'FEMALE', audienceAge: 'ADULTS',
      releaseDate: new Date('2024-12-25'), isFeatured: true, sortOrder: 3,
    },
    {
      title: 'Gladiator II',
      category: 'HOLLYWOOD', status: 'NOW_SHOWING',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e7/Gladiator_II_poster.jpg/220px-Gladiator_II_poster.jpg',
      genre: 'Action / Epic', rating: '15', durationMins: 148,
      director: 'Ridley Scott',
      synopsis: 'A new warrior rises through the ranks of the Roman Empire\'s deadly arena.',
      audienceGender: 'MALE', audienceAge: 'YOUNG_ADULTS',
      releaseDate: new Date('2024-11-22'), isFeatured: false, sortOrder: 4,
    },
    {
      title: 'Moana 2',
      category: 'ANIMATION', status: 'NOW_SHOWING',
      posterUrl: null,
      genre: 'Animation / Musical', rating: 'G', durationMins: 100,
      director: 'Dave Derrick Jr.',
      synopsis: 'Moana sets sail again on an unexpected voyage to far Polynesian seas.',
      audienceGender: 'MIXED', audienceAge: 'CHILDREN',
      releaseDate: new Date('2024-11-27'), isFeatured: false, sortOrder: 5,
    },
    {
      title: 'Breath of Life',
      category: 'NOLLYWOOD', status: 'NOW_SHOWING',
      posterUrl: null,
      genre: 'Drama / Romance', rating: 'PG', durationMins: 105,
      director: 'Kemi Adetiba',
      synopsis: 'A Lagos doctor discovers that saving lives includes mending her own heart.',
      audienceGender: 'FEMALE', audienceAge: 'ADULTS',
      releaseDate: new Date('2025-01-03'), isFeatured: false, sortOrder: 6,
    },
    {
      title: 'Captain America: Brave New World',
      category: 'HOLLYWOOD', status: 'NOW_SHOWING',
      posterUrl: null,
      genre: 'Action / Superhero', rating: 'PG-13', durationMins: 119,
      director: 'Julius Onah',
      synopsis: 'Sam Wilson steps fully into the shield as the new Captain America faces a global conspiracy.',
      audienceGender: 'MIXED', audienceAge: 'YOUNG_ADULTS',
      releaseDate: new Date('2025-02-14'), isFeatured: false, sortOrder: 7,
    },
    {
      title: 'The Weekend',
      category: 'NOLLYWOOD', status: 'NOW_SHOWING',
      posterUrl: null,
      genre: 'Thriller', rating: '18', durationMins: 98,
      director: 'Niyi Akinmolayan',
      synopsis: 'A couples getaway turns deadly when secrets buried for years finally surface.',
      audienceGender: 'MIXED', audienceAge: 'ADULTS',
      releaseDate: new Date('2025-01-17'), isFeatured: false, sortOrder: 8,
    },

    // COMING SOON
    {
      title: 'Sinners',
      category: 'HOLLYWOOD', status: 'COMING_SOON',
      posterUrl: null,
      genre: 'Horror / Thriller', rating: '18', durationMins: 137,
      director: 'Ryan Coogler',
      synopsis: 'Twin brothers trying to leave their troubled lives behind encounter an evil far more terrifying than anything they knew.',
      audienceGender: 'MIXED', audienceAge: 'YOUNG_ADULTS',
      releaseDate: new Date('2025-04-18'), isFeatured: true, sortOrder: 9,
    },
    {
      title: 'The Burial of Kojo',
      category: 'NOLLYWOOD', status: 'COMING_SOON',
      posterUrl: null,
      genre: 'Drama', rating: 'PG-13', durationMins: 90,
      director: 'Samuel Osei Kuffour',
      synopsis: 'A girl embarks on a spiritual journey to save her beloved father.',
      audienceGender: 'MIXED', audienceAge: 'MIXED',
      releaseDate: new Date('2025-04-04'), isFeatured: false, sortOrder: 10,
    },
    {
      title: 'Thunderbolts*',
      category: 'HOLLYWOOD', status: 'COMING_SOON',
      posterUrl: null,
      genre: 'Action / Superhero', rating: 'PG-13', durationMins: 127,
      director: 'Jake Schreier',
      synopsis: 'A ragtag group of antiheroes is assembled for one final mission.',
      audienceGender: 'MALE', audienceAge: 'YOUNG_ADULTS',
      releaseDate: new Date('2025-05-02'), isFeatured: false, sortOrder: 11,
    },
    {
      title: 'Anikulapo: Rise of the Spectre',
      category: 'NOLLYWOOD', status: 'COMING_SOON',
      posterUrl: null,
      genre: 'Fantasy / Epic', rating: '15', durationMins: 145,
      director: 'Kunle Afolayan',
      synopsis: 'The next chapter in the epic Anikulapo saga — a warrior destined by the gods.',
      audienceGender: 'MIXED', audienceAge: 'ADULTS',
      releaseDate: new Date('2025-06-20'), isFeatured: true, sortOrder: 12,
    },
  ]

  for (const filmData of filmsData) {
    await prisma.film.create({ data: filmData as any })
  }

  console.log(`✅ Seeded ${filmsData.length} films`)

  console.log('✅ Seeding complete!')
  console.log('\n🔑 Demo Credentials:')
  console.log('Admin: admin@onscreen.ng / Admin@123!')
  console.log('Advertiser: brand@example.com / Demo@123!')
  console.log('Media Owner: owner@silverbird.com / Media@123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
