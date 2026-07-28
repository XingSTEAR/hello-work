import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 真实的城市坐标（来自 OpenStreetMap）
const LOCATIONS: Record<string, { lat: number; lng: number; address: string }> = {
  '北京朝阳区': { lat: 39.9219, lng: 116.4435, address: '北京市朝阳区建国路88号SOHO现代城' },
  '上海浦东新区': { lat: 31.2304, lng: 121.4737, address: '上海市浦东新区陆家嘴环路1000号' },
  '广州天河区': { lat: 23.1291, lng: 113.2644, address: '广州市天河区体育西路111号天河城' },
  '深圳南山区': { lat: 22.5431, lng: 113.9526, address: '深圳市南山区科技园高新中四道' },
  '成都武侯区': { lat: 30.5728, lng: 104.0668, address: '成都市武侯区人民南路四段3号' },
  '杭州西湖区': { lat: 30.2592, lng: 120.1308, address: '杭州市西湖区文三路500号' },
  '武汉洪山区': { lat: 30.5002, lng: 114.3430, address: '武汉市洪山区珞喻路1037号' },
  '南京鼓楼区': { lat: 32.0584, lng: 118.7820, address: '南京市鼓楼区汉中路180号' },
  '重庆江北区': { lat: 29.6066, lng: 106.5700, address: '重庆市江北区建新南路1号' },
  '西安雁塔区': { lat: 34.2147, lng: 108.9352, address: '西安市雁塔区长安南路58号' },
}

async function main() {
  console.log('🌱 开始填充种子数据...')

  // 清空旧数据
  await prisma.message.deleteMany()
  await prisma.chatSession.deleteMany()
  await prisma.jobApplication.deleteMany()
  await prisma.review.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.job.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('123456', 10)

  // 创建劳动者
  const worker = await prisma.user.create({
    data: {
      email: 'worker@test.com',
      name: '张三',
      phone: '13800138001',
      password: hashedPassword,
      role: 'WORKER',
      balance: 5600,
      points: 850,
      level: 'GOLD',
      rating: 4.8,
      isVerified: true,
      avatar: '',
    },
  })
  console.log('✅ 劳动者账号创建:', worker.email)

  // 创建雇主1
  const employer = await prisma.user.create({
    data: {
      email: 'employer@test.com',
      name: '星巴克咖啡',
      phone: '13800138002',
      password: hashedPassword,
      role: 'EMPLOYER',
      balance: 20000,
      points: 1200,
      level: 'DIAMOND',
      rating: 4.9,
      isVerified: true,
      avatar: '',
    },
  })

  const company1 = await prisma.company.create({
    data: {
      name: '星巴克企业管理（中国）有限公司',
      description: '全球知名咖啡连锁品牌，在中国拥有超过6000家门店',
      industry: '餐饮服务',
      scale: '1000-5000人',
      address: LOCATIONS['上海浦东新区'].address,
      level: 'A',
      isVerified: true,
      userId: employer.id,
    },
  })
  console.log('✅ 雇主1创建:', employer.email)

  // 创建雇主2
  const employer2 = await prisma.user.create({
    data: {
      email: 'employer2@test.com',
      name: '顺丰速运',
      phone: '13800138003',
      password: hashedPassword,
      role: 'EMPLOYER',
      balance: 50000,
      points: 2300,
      level: 'S',
      rating: 4.7,
      isVerified: true,
      avatar: '',
    },
  })

  const company2 = await prisma.company.create({
    data: {
      name: '顺丰速运（集团）有限公司',
      description: '国内领先的综合物流服务商',
      industry: '物流配送',
      scale: '10000人以上',
      address: LOCATIONS['北京朝阳区'].address,
      level: 'S',
      isVerified: true,
      userId: employer2.id,
    },
  })
  console.log('✅ 雇主2创建:', employer2.email)

  // 创建第三个雇主
  const employer3 = await prisma.user.create({
    data: {
      email: 'retail@test.com',
      name: '永辉超市',
      phone: '13800138004',
      password: hashedPassword,
      role: 'EMPLOYER',
      balance: 30000,
      points: 900,
      level: 'GOLD',
      rating: 4.5,
      isVerified: true,
      avatar: '',
    },
  })

  const company3 = await prisma.company.create({
    data: {
      name: '永辉超市股份有限公司',
      description: '全国性连锁超市，门店覆盖全国多个省市',
      industry: '零售促销',
      scale: '1000-5000人',
      address: LOCATIONS['广州天河区'].address,
      level: 'A',
      isVerified: true,
      userId: employer3.id,
    },
  })

  // 创建岗位（使用真实坐标）
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: '咖啡师临时工',
        description: '负责门店饮品制作、收银和客户服务。工作时间灵活，提供免费咖啡和培训。适合学生或兼职者。',
        category: '餐饮服务',
        salary: '280',
        salaryType: 'DAILY',
        location: '上海浦东新区',
        address: LOCATIONS['上海浦东新区'].address,
        latitude: LOCATIONS['上海浦东新区'].lat,
        longitude: LOCATIONS['上海浦东新区'].lng,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-31'),
        workHours: '9:00-18:00',
        headCount: 5,
        hiredCount: 2,
        status: 'OPEN',
        requirements: '年满18周岁，服务热情',
        benefits: '提供午餐、员工饮品免费',
        isInsured: true,
        tags: '灵活排班,无需经验,免费培训',
        views: 1280,
        employerId: employer.id,
        companyId: company1.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '快递分拣员',
        description: '负责快递包裹的分拣、扫描和归类。工作环境良好，团队氛围融洽。夜班有额外补贴。',
        category: '物流配送',
        salary: '35',
        salaryType: 'HOURLY',
        location: '北京朝阳区',
        address: LOCATIONS['北京朝阳区'].address,
        latitude: LOCATIONS['北京朝阳区'].lat,
        longitude: LOCATIONS['北京朝阳区'].lng,
        startDate: new Date('2026-08-05'),
        endDate: new Date('2026-09-30'),
        workHours: '14:00-22:00',
        headCount: 10,
        hiredCount: 3,
        status: 'OPEN',
        requirements: '身体健康，能适应站岗',
        benefits: '夜班补贴、加班1.5倍',
        isInsured: true,
        tags: '日结,提供工服,就近安排',
        views: 2350,
        employerId: employer2.id,
        companyId: company2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '超市促销员',
        description: '在永辉超市各门店进行商品促销和试吃推广活动。性格开朗、善于沟通者优先。',
        category: '零售促销',
        salary: '260',
        salaryType: 'DAILY',
        location: '广州天河区',
        address: LOCATIONS['广州天河区'].address,
        latitude: LOCATIONS['广州天河区'].lat,
        longitude: LOCATIONS['广州天河区'].lng,
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-08-25'),
        workHours: '10:00-19:00',
        headCount: 3,
        hiredCount: 1,
        status: 'OPEN',
        requirements: '性格开朗，善于沟通',
        benefits: '提供工作餐、促销提成',
        isInsured: false,
        tags: '周末兼职,提成丰厚',
        views: 890,
        employerId: employer3.id,
        companyId: company3.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '活动展会引导员',
        description: '大型车展现场引导和接待工作。要求形象良好，普通话标准，有大型活动经验者优先。',
        category: '活动展会',
        salary: '400',
        salaryType: 'DAILY',
        location: '深圳南山区',
        address: LOCATIONS['深圳南山区'].address,
        latitude: LOCATIONS['深圳南山区'].lat,
        longitude: LOCATIONS['深圳南山区'].lng,
        startDate: new Date('2026-08-15'),
        endDate: new Date('2026-08-20'),
        workHours: '8:30-17:30',
        headCount: 20,
        hiredCount: 8,
        status: 'OPEN',
        requirements: '形象端正，普通话标准',
        benefits: '提供午餐+交通补贴',
        isInsured: true,
        tags: '短期高薪,可开实习证明',
        views: 3150,
        employerId: employer.id,
        companyId: company1.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '家政保洁员',
        description: '负责高端住宅小区的日常保洁服务。工作稳定，就近安排，工具公司配备。',
        category: '家政服务',
        salary: '300',
        salaryType: 'DAILY',
        location: '杭州西湖区',
        address: LOCATIONS['杭州西湖区'].address,
        latitude: LOCATIONS['杭州西湖区'].lat,
        longitude: LOCATIONS['杭州西湖区'].lng,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-10-31'),
        workHours: '8:00-17:00',
        headCount: 8,
        hiredCount: 4,
        status: 'OPEN',
        requirements: '责任心强，有保洁经验优先',
        benefits: '提供工具、高温补贴',
        isInsured: true,
        tags: '就近安排,长期稳定',
        views: 1560,
        employerId: employer3.id,
        companyId: company3.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '展会翻译助理（英语）',
        description: '国际贸易展会现场翻译协助，要求英语流利。陪同外宾参观展台，协助交流沟通。',
        category: '临时文员',
        salary: '600',
        salaryType: 'DAILY',
        location: '成都武侯区',
        address: LOCATIONS['成都武侯区'].address,
        latitude: LOCATIONS['成都武侯区'].lat,
        longitude: LOCATIONS['成都武侯区'].lng,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-05'),
        workHours: '9:00-18:00',
        headCount: 5,
        hiredCount: 2,
        status: 'OPEN',
        requirements: '英语专业或CET-6以上',
        benefits: '含午餐、交通补助',
        isInsured: true,
        tags: '高薪,锻炼英语,名企实习',
        views: 4200,
        employerId: employer2.id,
        companyId: company2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '外卖骑手',
        description: '负责区域内外卖订单配送。自备电动车或公司可以提供租赁。多劳多得，上不封顶。',
        category: '物流配送',
        salary: '40',
        salaryType: 'HOURLY',
        location: '武汉洪山区',
        address: LOCATIONS['武汉洪山区'].address,
        latitude: LOCATIONS['武汉洪山区'].lat,
        longitude: LOCATIONS['武汉洪山区'].lng,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-31'),
        workHours: '10:00-22:00（可拆分）',
        headCount: 15,
        hiredCount: 5,
        status: 'OPEN',
        requirements: '会骑电动车，熟悉当地路况',
        benefits: '高温/雨天补贴、冲单奖励',
        isInsured: true,
        tags: '多劳多得,时间自由,可兼职',
        views: 5600,
        employerId: employer2.id,
        companyId: company2.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '数据录入文员',
        description: '负责公司历史档案的数字化录入工作。要求打字速度快，细心认真。办公环境舒适。',
        category: '临时文员',
        salary: '5200',
        salaryType: 'MONTHLY',
        location: '南京鼓楼区',
        address: LOCATIONS['南京鼓楼区'].address,
        latitude: LOCATIONS['南京鼓楼区'].lat,
        longitude: LOCATIONS['南京鼓楼区'].lng,
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-11-10'),
        workHours: '9:00-18:00 双休',
        headCount: 3,
        hiredCount: 1,
        status: 'OPEN',
        requirements: '打字60字/分以上',
        benefits: '五险一金、带薪培训',
        isInsured: true,
        tags: '办公室,双休,稳定收入',
        views: 1890,
        employerId: employer.id,
        companyId: company1.id,
      },
    }),
  ])

  console.log(`✅ ${jobs.length} 个岗位创建成功`)

  console.log('\n🎉 种子数据填充完成！')
  console.log('\n📋 演示账号:')
  console.log('  劳动者: worker@test.com / 123456')
  console.log('  雇主1: employer@test.com / 123456')
  console.log('  雇主2: employer2@test.com / 123456')
  console.log('  零售商: retail@test.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
