import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm araçları listele
export const getAllVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, isActive, search } = req.query;

    const where: any = {};

    if (type) where.type = type as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { plate: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
        { model: { contains: search as string, mode: 'insensitive' } },
        { driverName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek araç getir
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Araç bulunamadı' });
      return;
    }

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni araç oluştur
export const createVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      plate,
      brand,
      model,
      year,
      type,
      capacity,
      color,
      driverName,
      driverPhone,
      insuranceExpiry,
      maintenanceDate,
      notes,
    } = req.body;

    // Validasyon
    if (!plate || !brand || !model || !type || !capacity) {
      res.status(400).json({ error: 'Plaka, marka, model, tip ve kapasite zorunludur' });
      return;
    }

    // Plaka kontrolü
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate },
    });

    if (existingVehicle) {
      res.status(409).json({ error: 'Bu plaka zaten kayıtlı' });
      return;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        brand,
        model,
        year: year ? parseInt(year) : null,
        type,
        capacity: parseInt(capacity),
        color,
        driverName,
        driverPhone,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : null,
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Araç başarıyla oluşturuldu',
      data: vehicle,
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Araç güncelle
export const updateVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      plate,
      brand,
      model,
      year,
      type,
      capacity,
      color,
      driverName,
      driverPhone,
      insuranceExpiry,
      maintenanceDate,
      notes,
      isActive,
    } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Araç bulunamadı' });
      return;
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: parseInt(id!) },
      data: {
        plate,
        brand,
        model,
        year: year ? parseInt(year) : null,
        type,
        capacity: capacity ? parseInt(capacity) : vehicle.capacity,
        color,
        driverName,
        driverPhone,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : null,
        notes,
        isActive,
      },
    });

    res.json({
      success: true,
      message: 'Araç başarıyla güncellendi',
      data: updatedVehicle,
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Araç sil
export const deleteVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Araç bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.vehicle.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Araç başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Araç istatistikleri
export const getVehicleStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await prisma.vehicle.count();
    const active = await prisma.vehicle.count({ where: { isActive: true } });
    const byType = await prisma.vehicle.groupBy({
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
    console.error('Get vehicle stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
