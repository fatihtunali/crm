import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// ============================================
// TOUR TEMPLATE CRUD
// ============================================

// Get all tour templates
export const getAllTourTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await prisma.tourTemplate.findMany({
      where: { isActive: true },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            activities: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get tour templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur şablonları alınırken hata oluştu',
    });
  }
};

// Get single tour template with full details
export const getTourTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.tourTemplate.findUnique({
      where: { id: parseInt(id!) },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            activities: true,
          },
        },
      },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: 'Tur şablonu bulunamadı',
      });
      return;
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Get tour template error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur şablonu alınırken hata oluştu',
    });
  }
};

// Create tour template with days and activities
export const createTourTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      totalDays,
      estimatedCost,
      estimatedPrice,
      currency,
      notes,
      days, // Array of days with activities
    } = req.body;

    const template = await prisma.tourTemplate.create({
      data: {
        name,
        description,
        totalDays: parseInt(totalDays),
        estimatedCost,
        estimatedPrice,
        currency: currency || 'EUR',
        notes,
        createdBy: req.user!.userId,
        days: {
          create: days?.map((day: any) => ({
            dayNumber: parseInt(day.dayNumber),
            hotelId: day.hotelId ? parseInt(day.hotelId) : null,
            roomType: day.roomType || null,
            guideId: day.guideId ? parseInt(day.guideId) : null,
            guideService: day.guideService || null,
            vehicleType: day.vehicleType || null,
            transferType: day.transferType || null,
            breakfast: day.breakfast || false,
            lunch: day.lunch || false,
            dinner: day.dinner || false,
            description: day.description,
            notes: day.notes || null,
            dayCost: day.dayCost,
            dayPrice: day.dayPrice,
            activities: {
              create: day.activities?.map((activity: any) => ({
                activityType: activity.activityType,
                supplierId: activity.supplierId ? parseInt(activity.supplierId) : null,
                name: activity.name,
                cost: activity.cost,
                price: activity.price,
                notes: activity.notes || null,
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        days: {
          include: {
            activities: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Create tour template error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur şablonu oluşturulurken hata oluştu',
    });
  }
};

// Update tour template
export const updateTourTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      totalDays,
      estimatedCost,
      estimatedPrice,
      currency,
      notes,
      isActive,
    } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (totalDays !== undefined) updateData.totalDays = parseInt(totalDays);
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    if (estimatedPrice !== undefined) updateData.estimatedPrice = estimatedPrice;
    if (currency !== undefined) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.tourTemplate.update({
      where: { id: parseInt(id!) },
      data: updateData,
      include: {
        days: {
          include: {
            activities: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Update tour template error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur şablonu güncellenirken hata oluştu',
    });
  }
};

// Delete tour template (soft delete)
export const deleteTourTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.tourTemplate.update({
      where: { id: parseInt(id!) },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tur şablonu silindi',
    });
  } catch (error) {
    console.error('Delete tour template error:', error);
    res.status(500).json({
      success: false,
      error: 'Tur şablonu silinirken hata oluştu',
    });
  }
};

// ============================================
// TOUR TEMPLATE DAY CRUD
// ============================================

// Add day to template
export const addDayToTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const {
      dayNumber,
      hotelId,
      roomType,
      guideId,
      guideService,
      vehicleType,
      transferType,
      breakfast,
      lunch,
      dinner,
      description,
      notes,
      dayCost,
      dayPrice,
      activities,
    } = req.body;

    const day = await prisma.tourTemplateDay.create({
      data: {
        templateId: parseInt(templateId!),
        dayNumber: parseInt(dayNumber),
        hotelId: hotelId ? parseInt(hotelId) : null,
        roomType: roomType || null,
        guideId: guideId ? parseInt(guideId) : null,
        guideService: guideService || null,
        vehicleType: vehicleType || null,
        transferType: transferType || null,
        breakfast: breakfast || false,
        lunch: lunch || false,
        dinner: dinner || false,
        description,
        notes: notes || null,
        dayCost,
        dayPrice,
        activities: {
          create: activities?.map((activity: any) => ({
            activityType: activity.activityType,
            supplierId: activity.supplierId ? parseInt(activity.supplierId) : null,
            name: activity.name,
            cost: activity.cost,
            price: activity.price,
            notes: activity.notes || null,
          })) || [],
        },
      },
      include: {
        activities: true,
      },
    });

    res.status(201).json({
      success: true,
      data: day,
    });
  } catch (error) {
    console.error('Add template day error:', error);
    res.status(500).json({
      success: false,
      error: 'Gün eklenirken hata oluştu',
    });
  }
};

// Update template day
export const updateTemplateDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dayId } = req.params;
    const {
      dayNumber,
      hotelId,
      roomType,
      guideId,
      guideService,
      vehicleType,
      transferType,
      breakfast,
      lunch,
      dinner,
      description,
      notes,
      dayCost,
      dayPrice,
    } = req.body;

    const updateData: any = {};

    if (dayNumber !== undefined) updateData.dayNumber = parseInt(dayNumber);
    if (hotelId !== undefined) updateData.hotelId = hotelId ? parseInt(hotelId) : null;
    if (roomType !== undefined) updateData.roomType = roomType;
    if (guideId !== undefined) updateData.guideId = guideId ? parseInt(guideId) : null;
    if (guideService !== undefined) updateData.guideService = guideService;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (transferType !== undefined) updateData.transferType = transferType;
    if (breakfast !== undefined) updateData.breakfast = breakfast;
    if (lunch !== undefined) updateData.lunch = lunch;
    if (dinner !== undefined) updateData.dinner = dinner;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (dayCost !== undefined) updateData.dayCost = dayCost;
    if (dayPrice !== undefined) updateData.dayPrice = dayPrice;

    const day = await prisma.tourTemplateDay.update({
      where: { id: parseInt(dayId!) },
      data: updateData,
      include: {
        activities: true,
      },
    });

    res.json({
      success: true,
      data: day,
    });
  } catch (error) {
    console.error('Update template day error:', error);
    res.status(500).json({
      success: false,
      error: 'Gün güncellenirken hata oluştu',
    });
  }
};

// Delete template day
export const deleteTemplateDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dayId } = req.params;

    await prisma.tourTemplateDay.delete({
      where: { id: parseInt(dayId!) },
    });

    res.json({
      success: true,
      message: 'Gün silindi',
    });
  } catch (error) {
    console.error('Delete template day error:', error);
    res.status(500).json({
      success: false,
      error: 'Gün silinirken hata oluştu',
    });
  }
};

// ============================================
// TOUR TEMPLATE ACTIVITY CRUD
// ============================================

// Add activity to template day
export const addActivityToDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dayId } = req.params;
    const {
      activityType,
      supplierId,
      name,
      cost,
      price,
      notes,
    } = req.body;

    const activity = await prisma.tourTemplateActivity.create({
      data: {
        dayId: parseInt(dayId!),
        activityType,
        supplierId: supplierId ? parseInt(supplierId) : null,
        name,
        cost,
        price,
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Add template activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Aktivite eklenirken hata oluştu',
    });
  }
};

// Update template activity
export const updateTemplateActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;
    const {
      activityType,
      supplierId,
      name,
      cost,
      price,
      notes,
    } = req.body;

    const activity = await prisma.tourTemplateActivity.update({
      where: { id: parseInt(activityId!) },
      data: {
        activityType,
        supplierId: supplierId ? parseInt(supplierId) : null,
        name,
        cost,
        price,
        notes,
      },
    });

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Update template activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Aktivite güncellenirken hata oluştu',
    });
  }
};

// Delete template activity
export const deleteTemplateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;

    await prisma.tourTemplateActivity.delete({
      where: { id: parseInt(activityId!) },
    });

    res.json({
      success: true,
      message: 'Aktivite silindi',
    });
  } catch (error) {
    console.error('Delete template activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Aktivite silinirken hata oluştu',
    });
  }
};

// ============================================
// SPECIAL: COPY TEMPLATE TO RESERVATION
// ============================================

/**
 * Creates a new reservation based on a tour template
 * This is the magic endpoint that saves time by reusing templates
 */
export const createReservationFromTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const {
      customerId,
      startDate,
      participants, // Array of participants
      priceAdjustment, // Optional price adjustment
      costAdjustment, // Optional cost adjustment
      notes,
    } = req.body;

    // Get the template with all details
    const template = await prisma.tourTemplate.findUnique({
      where: { id: parseInt(templateId!) },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            activities: true,
          },
        },
      },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: 'Tur şablonu bulunamadı',
      });
      return;
    }

    // Calculate dates for each day
    const baseDate = new Date(startDate);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + template.totalDays - 1);

    // Calculate total cost and price (with adjustments)
    const totalCost = Number(template.estimatedCost) + (costAdjustment || 0);
    const totalPrice = Number(template.estimatedPrice) + (priceAdjustment || 0);
    const profit = totalPrice - totalCost;

    // Generate unique reservation code
    const reservationCode = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create reservation with template data
    const reservation = await prisma.reservation.create({
      data: {
        customerId: parseInt(customerId),
        reservationCode,
        startDate: baseDate,
        endDate: endDate,
        totalDays: template.totalDays,
        totalCost,
        totalPrice,
        profit,
        currency: template.currency,
        notes: notes || `Şablondan oluşturuldu: ${template.name}\n\n${template.notes || ''}`,
        createdBy: req.user!.userId,
        // Create participants
        participants: {
          create: participants?.map((p: any) => ({
            participantType: p.participantType,
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
            nationality: p.nationality || null,
            passportNumber: p.passportNumber || null,
            age: p.age ? parseInt(p.age) : null,
          })) || [],
        },
        // Copy template days to reservation days
        days: {
          create: template.days.map((day) => {
            const dayDate = new Date(baseDate);
            dayDate.setDate(dayDate.getDate() + day.dayNumber - 1);

            return {
              dayNumber: day.dayNumber,
              date: dayDate,
              hotelId: day.hotelId,
              roomType: day.roomType,
              guideId: day.guideId,
              guideService: day.guideService,
              vehicleType: day.vehicleType,
              transferType: day.transferType,
              breakfast: day.breakfast,
              lunch: day.lunch,
              dinner: day.dinner,
              description: day.description,
              notes: day.notes,
              dayCost: day.dayCost,
              dayPrice: day.dayPrice,
              // Copy template activities to reservation activities
              activities: {
                create: day.activities.map((activity) => ({
                  activityType: activity.activityType,
                  supplierId: activity.supplierId,
                  name: activity.name,
                  cost: activity.cost,
                  price: activity.price,
                  notes: activity.notes,
                })),
              },
            };
          }),
        },
      },
      include: {
        customer: {
          include: {
            agent: true,
          },
        },
        participants: true,
        days: {
          include: {
            hotel: true,
            guide: true,
            activities: {
              include: {
                supplier: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    res.status(201).json({
      success: true,
      data: reservation,
      message: `Rezervasyon "${template.name}" şablonundan başarıyla oluşturuldu`,
    });
  } catch (error) {
    console.error('Create reservation from template error:', error);
    res.status(500).json({
      success: false,
      error: 'Şablondan rezervasyon oluşturulurken hata oluştu',
    });
  }
};
