import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm tedarikçileri listele
export const getAllSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, city, isActive, search } = req.query;

    const where: any = {};

    if (type) where.type = type as string;
    if (city) where.city = city as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek tedarikçi getir
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni tedarikçi oluştur
export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      type,
      address,
      city,
      phone,
      email,
      contactPerson,
      taxNumber,
      notes,
    } = req.body;

    // Validasyon
    if (!name || !type) {
      res.status(400).json({ error: 'Ad ve tip zorunludur' });
      return;
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        type,
        address,
        city,
        phone,
        email,
        contactPerson,
        taxNumber,
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tedarikçi başarıyla oluşturuldu',
      data: supplier,
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tedarikçi güncelle
export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      address,
      city,
      phone,
      email,
      contactPerson,
      taxNumber,
      notes,
      isActive,
    } = req.body;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: parseInt(id!) },
      data: {
        name,
        type,
        address,
        city,
        phone,
        email,
        contactPerson,
        taxNumber,
        notes,
        isActive,
      },
    });

    res.json({
      success: true,
      message: 'Tedarikçi başarıyla güncellendi',
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tedarikçi sil
export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.supplier.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tedarikçi başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tedarikçi istatistikleri
export const getSupplierStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await prisma.supplier.count();
    const active = await prisma.supplier.count({ where: { isActive: true } });
    const byType = await prisma.supplier.groupBy({
      by: ['type'],
      _count: true,
      where: { isActive: true },
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        byType,
      },
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
