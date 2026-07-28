import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/jobs - List jobs with filters
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { category, salaryType, location, keyword, limit } = req.query

    const where: any = { status: 'OPEN' }

    if (category && category !== '全部') {
      where.category = category as string
    }

    if (salaryType) {
      where.salaryType = salaryType as string
    }

    if (location) {
      where.location = { contains: location as string }
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword as string } },
        { description: { contains: keyword as string } },
        { tags: { contains: keyword as string } },
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: { id: true, name: true, rating: true, level: true },
        },
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 50,
    })

    return res.json({
      success: true,
      data: jobs.map((job) => ({
        ...job,
        applications: undefined,
        applicationsCount: job._count.applications,
      })),
    })
  } catch (error) {
    console.error('List jobs error:', error)
    return res.status(500).json({ success: false, error: '获取岗位列表失败' })
  }
})

// GET /api/jobs/my - Get current user's posted jobs (employer)
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { employerId: req.userId },
      include: {
        company: true,
        applications: {
          include: {
            worker: {
              select: { id: true, name: true, phone: true, rating: true, level: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ success: true, data: jobs })
  } catch (error) {
    console.error('My jobs error:', error)
    return res.status(500).json({ success: false, error: '获取我的岗位失败' })
  }
})

// GET /api/jobs/:id - Get job detail
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: {
          select: { id: true, name: true, rating: true, level: true, phone: true },
        },
        company: true,
      },
    })

    if (!job) {
      return res.status(404).json({ success: false, error: '岗位不存在' })
    }

    // Increment view count
    await prisma.job.update({
      where: { id: job.id },
      data: { views: { increment: 1 } },
    })

    return res.json({ success: true, data: job })
  } catch (error) {
    console.error('Get job error:', error)
    return res.status(500).json({ success: false, error: '获取岗位详情失败' })
  }
})

// POST /api/jobs - Create a new job (employer only)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'EMPLOYER') {
      return res.status(403).json({ success: false, error: '只有企业账号才能发布岗位' })
    }

    const {
      title, description, category, salary, salaryType,
      location, address, workHours, startDate, endDate,
      headCount, requirements, benefits, tags, isInsured,
    } = req.body

    if (!title || !salary || !location || !startDate) {
      return res.status(400).json({ success: false, error: '请填写必填字段' })
    }

    const company = await prisma.company.findUnique({
      where: { userId: req.userId },
    })

    const job = await prisma.job.create({
      data: {
        title,
        description: description || '',
        category: category || '其他',
        salary: salary.toString(),
        salaryType: salaryType || 'DAILY',
        location,
        address: address || location,
        workHours: workHours || '',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        headCount: parseInt(headCount) || 1,
        requirements: requirements || '',
        benefits: benefits || '',
        tags: tags || '',
        isInsured: isInsured || false,
        employerId: req.userId!,
        companyId: company?.id || null,
      },
      include: {
        employer: {
          select: { id: true, name: true, rating: true, level: true },
        },
        company: true,
      },
    })

    return res.json({ success: true, data: job })
  } catch (error) {
    console.error('Create job error:', error)
    return res.status(500).json({ success: false, error: '发布岗位失败' })
  }
})

// PUT /api/jobs/:id - Update job
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })
    if (!job) {
      return res.status(404).json({ success: false, error: '岗位不存在' })
    }
    if (job.employerId !== req.userId) {
      return res.status(403).json({ success: false, error: '无权修改此岗位' })
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: req.body,
    })

    return res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update job error:', error)
    return res.status(500).json({ success: false, error: '更新岗位失败' })
  }
})

// POST /api/jobs/:id/apply - Apply for a job (worker only)
router.post('/:id/apply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'WORKER') {
      return res.status(403).json({ success: false, error: '只有劳动者才能报名岗位' })
    }

    const jobId = req.params.id
    const job = await prisma.job.findUnique({ where: { id: jobId } })

    if (!job || job.status !== 'OPEN') {
      return res.status(400).json({ success: false, error: '该岗位已关闭或不存在' })
    }

    if (job.hiredCount >= job.headCount) {
      return res.status(400).json({ success: false, error: '该岗位已招满' })
    }

    // Check duplicate
    const existing = await prisma.jobApplication.findFirst({
      where: { jobId, workerId: req.userId },
    })

    if (existing) {
      return res.status(400).json({ success: false, error: '你已经报名过该岗位' })
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        workerId: req.userId!,
        message: req.body.message || '',
      },
    })

    return res.json({ success: true, data: application })
  } catch (error) {
    console.error('Apply job error:', error)
    return res.status(500).json({ success: false, error: '报名失败' })
  }
})

// GET /api/jobs/applications/my - Get my applications
router.get('/applications/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { workerId: req.userId },
      include: {
        job: {
          select: {
            id: true, title: true, salary: true, salaryType: true,
            location: true, employerId: true, status: true,
            employer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ success: true, data: applications })
  } catch (error) {
    console.error('Get applications error:', error)
    return res.status(500).json({ success: false, error: '获取报名列表失败' })
  }
})

// GET /api/jobs/:jobId/applications - Get applications for a job (employer)
router.get('/:jobId/applications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } })
    if (!job || job.employerId !== req.userId) {
      return res.status(403).json({ success: false, error: '无权查看' })
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: req.params.jobId },
      include: {
        worker: {
          select: { id: true, name: true, phone: true, rating: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ success: true, data: applications })
  } catch (error) {
    console.error('Get job applications error:', error)
    return res.status(500).json({ success: false, error: '获取报名列表失败' })
  }
})

export default router
