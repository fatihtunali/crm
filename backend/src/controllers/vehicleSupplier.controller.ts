import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm araç tedarikçilerini listele
export const getAllVehicleSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, isActive, search } = req.query;

    const where: any = {};

    // Filtreleme
    if (city) where.city = city as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.vehicleSupplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        transferPricings: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        allocationPricings: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error('Get vehicle suppliers error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek araç tedarikçisi getir
export const getVehicleSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await prisma.vehicleSupplier.findUnique({
      where: { id: parseInt(id!) },
      include: {
        transferPricings: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        allocationPricings: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
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
    console.error('Get vehicle supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni araç tedarikçisi oluştur
export const createVehicleSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      city,
      taxNumber,
      notes,
    } = req.body;

    // Validasyon
    if (!name) {
      res.status(400).json({ error: 'Tedarikçi adı zorunludur' });
      return;
    }

    const supplier = await prisma.vehicleSupplier.create({
      data: {
        name,
        contactPerson,
        phone,
        email,
        address,
        city,
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
    console.error('Create vehicle supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Araç tedarikçisi güncelle
export const updateVehicleSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      city,
      taxNumber,
      notes,
      isActive,
    } = req.body;

    const supplier = await prisma.vehicleSupplier.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    const updatedSupplier = await prisma.vehicleSupplier.update({
      where: { id: parseInt(id!) },
      data: {
        name,
        contactPerson,
        phone,
        email,
        address,
        city,
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
    console.error('Update vehicle supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Araç tedarikçisi sil
export const deleteVehicleSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await prisma.vehicleSupplier.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!supplier) {
      res.status(404).json({ error: 'Tedarikçi bulunamadı' });
      return;
    }

    // Soft delete (isActive = false)
    await prisma.vehicleSupplier.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tedarikçi başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete vehicle supplier error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Araç tedarikçi istatistikleri
export const getVehicleSupplierStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await prisma.vehicleSupplier.count();
    const active = await prisma.vehicleSupplier.count({ where: { isActive: true } });
    const byCity = await prisma.vehicleSupplier.groupBy({
      by: ['city'],
      _count: true,
      where: { isActive: true },
    });

    // Transfer pricing count
    const totalTransfers = await prisma.transferPricing.count({ where: { isActive: true } });

    // Allocation pricing count
    const totalAllocations = await prisma.vehicleAllocationPricing.count({ where: { isActive: true } });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        byCity,
        totalTransfers,
        totalAllocations,
      },
    });
  } catch (error) {
    console.error('Get vehicle supplier stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
