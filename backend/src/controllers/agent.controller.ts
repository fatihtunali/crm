import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm acenteleri listele
export const getAllAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, isActive, search } = req.query;

    const where: any = {};

    // Filtreleme
    if (city) where.city = city as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customers: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { customers: true },
        },
      },
    });

    res.json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek acente getir
export const getAgentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(id!) },
      include: {
        customers: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        contactHistory: {
          orderBy: { contactDate: 'desc' },
          take: 20,
        },
        _count: {
          select: { customers: true },
        },
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Acente bulunamadı' });
      return;
    }

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni acente oluştur
export const createAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkisiz erişim' });
      return;
    }

    const {
      companyName,
      taxNumber,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      paymentTerms,
      creditLimit,
      commissionRate,
      contractStart,
      contractEnd,
      notes,
    } = req.body;

    // Validation
    if (!companyName || !contactPerson || !email || !phone) {
      res.status(400).json({ error: 'Zorunlu alanları doldurun' });
      return;
    }

    const agent = await prisma.agent.create({
      data: {
        companyName,
        taxNumber,
        contactPerson,
        email,
        phone,
        address,
        city,
        country,
        paymentTerms,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        notes,
        createdBy: userId,
      },
    });

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Acente güncelle
export const updateAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const {
      companyName,
      taxNumber,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      paymentTerms,
      creditLimit,
      commissionRate,
      contractStart,
      contractEnd,
      notes,
      isActive,
    } = req.body;

    const agent = await prisma.agent.update({
      where: { id: parseInt(id) },
      data: {
        companyName,
        taxNumber,
        contactPerson,
        email,
        phone,
        address,
        city,
        country,
        paymentTerms,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        notes,
        isActive,
      },
    });

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Acente sil (soft delete)
export const deleteAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await prisma.agent.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Acente silindi',
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Acente iletişim geçmişi getir
export const getAgentContactHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId } = req.params as { agentId: string };

    const history = await prisma.agentContactHistory.findMany({
      where: { agentId: parseInt(agentId) },
      orderBy: { contactDate: 'desc' },
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get agent contact history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Acente iletişim kaydı ekle
export const addAgentContactHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { agentId } = req.params as { agentId: string };
    const { contactType, subject, notes, contactDate } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Yetkisiz erişim' });
      return;
    }

    const history = await prisma.agentContactHistory.create({
      data: {
        agentId: parseInt(agentId),
        contactType,
        subject,
        notes,
        contactDate: contactDate ? new Date(contactDate) : new Date(),
        createdBy: userId,
      },
    });

    res.status(201).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Add agent contact history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Acente iletişim kaydı sil
export const deleteAgentContactHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await prisma.agentContactHistory.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'İletişim kaydı silindi',
    });
  } catch (error) {
    console.error('Delete agent contact history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
