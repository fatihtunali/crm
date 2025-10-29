import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Tüm otelleri listele
export const getAllHotels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, isActive, search } = req.query;

    const where: any = {};

    // Filtreleme
    if (city) where.city = city as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pricings: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    res.json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tek otel getir
export const getHotelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id!) },
      include: {
        pricings: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Otel bulunamadı' });
      return;
    }

    res.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni otel oluştur
export const createHotel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      address,
      city,
      country,
      phone,
      email,
      stars,
      contactPerson,
      facilities,
      notes,
    } = req.body;

    // Validasyon
    if (!name || !address || !city) {
      res.status(400).json({ error: 'Ad, adres ve şehir zorunludur' });
      return;
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        address,
        city,
        country: country || 'Turkey',
        phone,
        email,
        stars: stars ? parseInt(stars) : null,
        contactPerson,
        facilities: facilities || [],
        notes,
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Otel başarıyla oluşturuldu',
      data: hotel,
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Otel güncelle
export const updateHotel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      city,
      country,
      phone,
      email,
      stars,
      contactPerson,
      facilities,
      notes,
      isActive,
    } = req.body;

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Otel bulunamadı' });
      return;
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: parseInt(id!) },
      data: {
        name,
        address,
        city,
        country,
        phone,
        email,
        stars: stars ? parseInt(stars) : null,
        contactPerson,
        facilities,
        notes,
        isActive,
      },
    });

    res.json({
      success: true,
      message: 'Otel başarıyla güncellendi',
      data: updatedHotel,
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Otel sil
export const deleteHotel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id!) },
    });

    if (!hotel) {
      res.status(404).json({ error: 'Otel bulunamadı' });
      return;
    }

    // Soft delete (isActive = false)
    await prisma.hotel.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Otel başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Otel istatistikleri
export const getHotelStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await prisma.hotel.count();
    const active = await prisma.hotel.count({ where: { isActive: true } });
    const byCity = await prisma.hotel.groupBy({
      by: ['city'],
      _count: true,
      where: { isActive: true },
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        byCity,
      },
    });
  } catch (error) {
    console.error('Get hotel stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
