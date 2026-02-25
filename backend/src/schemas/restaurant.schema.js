import Joi from 'joi';

export const updateRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  phone: Joi.string().pattern(/^\d{10}$/).optional(),
  address: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  gstNumber: Joi.string().trim().optional(),
  timezone: Joi.string().optional(),
});

export const updateRestaurantSettingsSchema = Joi.object({
  enableGST: Joi.boolean().optional(),
  defaultGSTPercent: Joi.number().min(0).max(100).optional(),
  currency: Joi.string().valid('INR', 'USD').default('INR'),
});

export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
});
