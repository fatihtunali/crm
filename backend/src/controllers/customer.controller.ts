import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm müşterileri listele
export const getAllCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agentId, city, isActive, search, type } = req.query;

    const where: any = {};

    // B2B vs B2C filtreleme
    if (type === 'b2c') {
      where.agentId = null; // B2C = direkt müşteriler
    } else if (type === 'b2b') {
      where.agentId = { not: null }; // B2B = acente müşterileri
    } else if (agentId) {
      where.agentId = parseInt(agentId as string);
    }

    // Diğer filtreler
    if (city) where.city = city as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek müşteri getir
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        agent: true,
        contactHistory: {
          orderBy: { contactDate: 'desc' },
          take: 20,
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Müşteri bulunamadı' });
      return;
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni müşteri oluştur
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkisiz erişim' });
      return;
    }

    const {
      agentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      passportNumber,
      passportExpiry,
      address,
      city,
      country,
      preferences,
      emergencyContact,
      emergencyPhone,
      marketingConsent,
      loyaltyPoints,
      notes,
      tags,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      res.status(400).json({ error: 'Zorunlu alanları doldurun' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        agentId: agentId ? parseInt(agentId) : null,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        passportNumber,
        passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
        address,
        city,
        country,
        preferences: preferences || null,
        emergencyContact,
        emergencyPhone,
        marketingConsent: marketingConsent || false,
        loyaltyPoints: loyaltyPoints || 0,
        notes,
        tags: tags || [],
        createdBy: userId,
      },
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Müşteri güncelle
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const {
      agentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      passportNumber,
      passportExpiry,
      address,
      city,
      country,
      preferences,
      emergencyContact,
      emergencyPhone,
      marketingConsent,
      loyaltyPoints,
      notes,
      tags,
      isActive,
    } = req.body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        agentId: agentId ? parseInt(agentId) : null,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        passportNumber,
        passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
        address,
        city,
        country,
        preferences: preferences || null,
        emergencyContact,
        emergencyPhone,
        marketingConsent,
        loyaltyPoints,
        notes,
        tags: tags || [],
        isActive,
      },
    });

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Müşteri sil (soft delete)
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Müşteri silindi',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Müşteri iletişim geçmişi getir
export const getCustomerContactHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params as { customerId: string };

    const history = await prisma.customerContactHistory.findMany({
      where: { customerId: parseInt(customerId) },
      orderBy: { contactDate: 'desc' },
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get customer contact history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Müşteri iletişim kaydı ekle
export const addCustomerContactHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { customerId } = req.params as { customerId: string };
    const { contactType, subject, notes, contactDate } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Yetkisiz erişim' });
      return;
    }

    const history = await prisma.customerContactHistory.create({
      data: {
        customerId: parseInt(customerId),
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
    console.error('Add customer contact history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Müşteri iletişim kaydı sil
export const deleteCustomerContactHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await prisma.customerContactHistory.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'İletişim kaydı silindi',
    });
  } catch (error) {
    console.error('Delete customer contact history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
