import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm rehberleri listele
export const getAllGuides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language, isActive, search } = req.query;

    const where: any = {};

    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (language) {
      where.languages = { has: language as string };
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const guides = await prisma.guide.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek rehber getir
export const getGuideById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!guide) {
      res.status(404).json({ error: 'Rehber bulunamadı' });
      return;
    }

    res.json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni rehber oluştur
export const createGuide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      languages,
      specializations,
      licenseNumber,
      dailyRate,
      commission,
      rating,
      notes,
    } = req.body;

    // Validasyon
    if (!firstName || !lastName || !phone) {
      res.status(400).json({ error: 'Ad, soyad ve telefon zorunludur' });
      return;
    }

    const guide = await prisma.guide.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        languages: languages || [],
        specializations: specializations || [],
        licenseNumber,
        dailyRate,
        commission,
        rating,
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Rehber başarıyla oluşturuldu',
      data: guide,
    });
  } catch (error) {
    console.error('Create guide error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Rehber güncelle
export const updateGuide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      email,
      languages,
      specializations,
      licenseNumber,
      dailyRate,
      commission,
      rating,
      notes,
      isActive,
    } = req.body;

    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!guide) {
      res.status(404).json({ error: 'Rehber bulunamadı' });
      return;
    }

    const updatedGuide = await prisma.guide.update({
      where: { id: parseInt(id!) },
      data: {
        firstName,
        lastName,
        phone,
        email,
        languages,
        specializations,
        licenseNumber,
        dailyRate,
        commission,
        rating,
        notes,
        isActive,
      },
    });

    res.json({
      success: true,
      message: 'Rehber başarıyla güncellendi',
      data: updatedGuide,
    });
  } catch (error) {
    console.error('Update guide error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Rehber sil
export const deleteGuide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!guide) {
      res.status(404).json({ error: 'Rehber bulunamadı' });
      return;
    }

    // Soft delete
    await prisma.guide.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Rehber başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Rehber istatistikleri
export const getGuideStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await prisma.guide.count();
    const active = await prisma.guide.count({ where: { isActive: true } });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
      },
    });
  } catch (error) {
    console.error('Get guide stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
