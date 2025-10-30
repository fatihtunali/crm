import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// Get all reservations
export const getAllReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, customerId, startDate, endDate } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = parseInt(customerId as string);
    }

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ startDate: { gte: new Date(startDate as string) } });
      }
      if (endDate) {
        where.AND.push({ endDate: { lte: new Date(endDate as string) } });
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            agent: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        days: {
          include: {
            hotel: { select: { id: true, name: true } },
            guide: { select: { id: true, firstName: true, lastName: true } },
            activities: true,
          },
          orderBy: { dayNumber: 'asc' },
        },
        participants: true,
        _count: {
          select: { days: true, participants: true, payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      error: 'Rezervasyonlar alınırken hata oluştu',
    });
  }
};

// Get reservation by ID
export const getReservationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          include: {
            agent: {
              select: {
                id: true,
                companyName: true,
                contactPerson: true,
              },
            },
          },
        },
        days: {
          include: {
            hotel: true,
            guide: true,
            activities: {
              include: {
                supplier: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        participants: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!reservation) {
      res.status(404).json({
        success: false,
        error: 'Rezervasyon bulunamadı',
      });
      return;
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Rezervasyon alınırken hata oluştu',
    });
  }
};

// Generate unique reservation code
const generateReservationCode = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const lastReservation = await prisma.reservation.findFirst({
    where: {
      reservationCode: {
        startsWith: `REZ-${year}-`,
      },
    },
    orderBy: { id: 'desc' },
  });

  let nextNumber = 1;
  if (lastReservation) {
    const parts = lastReservation.reservationCode.split('-');
    if (parts[2]) {
      const lastNumber = parseInt(parts[2]);
      nextNumber = lastNumber + 1;
    }
  }

  return `REZ-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Create reservation
export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      startDate,
      endDate,
      totalDays,
      totalCost,
      totalPrice,
      profit,
      currency,
      adultCount,
      childCount,
      notes,
      internalNotes,
      participants,
      days,
    } = req.body;

    const reservationCode = await generateReservationCode();

    const reservation = await prisma.reservation.create({
      data: {
        reservationCode,
        customerId: parseInt(customerId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        totalCost,
        totalPrice,
        profit,
        currency: currency || 'EUR',
        adultCount: adultCount || 0,
        childCount: childCount || 0,
        notes,
        internalNotes,
        remainingAmount: totalPrice, // Initially, all unpaid
        createdBy: (req.user as any).id,
        ...(participants && {
          participants: {
            create: participants.map((p: any) => ({
              participantType: p.participantType,
              age: p.age,
              firstName: p.firstName,
              lastName: p.lastName,
            })),
          },
        }),
        ...(days && {
          days: {
            create: days.map((d: any) => ({
              dayNumber: d.dayNumber,
              date: new Date(d.date),
              hotelId: d.hotelId ? parseInt(d.hotelId) : null,
              roomType: d.roomType,
              transferType: d.transferType,
              vehicleType: d.vehicleType,
              guideId: d.guideId ? parseInt(d.guideId) : null,
              guideService: d.guideService,
              breakfast: d.breakfast || false,
              lunch: d.lunch || false,
              dinner: d.dinner || false,
              dayCost: d.dayCost || 0,
              dayPrice: d.dayPrice || 0,
              description: d.description,
              notes: d.notes,
              ...(d.activities && {
                activities: {
                  create: d.activities.map((a: any) => ({
                    activityType: a.activityType,
                    supplierId: a.supplierId ? parseInt(a.supplierId) : null,
                    name: a.name,
                    cost: a.cost,
                    price: a.price,
                    notes: a.notes,
                  })),
                },
              }),
            })),
          },
        }),
      },
      include: {
        customer: true,
        days: { include: { activities: true } },
        participants: true,
      },
    });

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Rezervasyon oluşturulurken hata oluştu',
    });
  }
};

// Update reservation
export const updateReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const {
      status,
      totalCost,
      totalPrice,
      profit,
      notes,
      internalNotes,
    } = req.body;

    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        status,
        totalCost,
        totalPrice,
        profit,
        notes,
        internalNotes,
      },
      include: {
        customer: true,
        days: true,
        participants: true,
      },
    });

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Rezervasyon güncellenirken hata oluştu',
    });
  }
};

// Delete reservation
export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await prisma.reservation.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Rezervasyon silindi',
    });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Rezervasyon silinirken hata oluştu',
    });
  }
};

// Add payment to reservation
export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { amount, currency, paymentMethod, paymentDate, notes } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!reservation) {
      res.status(404).json({
        success: false,
        error: 'Rezervasyon bulunamadı',
      });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        reservationId: parseInt(id),
        amount,
        currency: currency || 'EUR',
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes,
        createdBy: (req.user as any).id,
      },
    });

    // Update reservation paid/remaining amounts
    const newPaidAmount = Number(reservation.paidAmount) + Number(amount);
    const newRemainingAmount = Number(reservation.totalPrice) - newPaidAmount;

    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
      },
    });

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ödeme eklenirken hata oluştu',
    });
  }
};
