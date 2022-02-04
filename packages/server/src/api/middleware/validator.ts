/**
 * Middleware for req validation
 */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export class ValidationError extends Error {}

/**
 * validation function
 * @param schemas {Array|Object} Single or array of Joi schemas
 */
export const validate = (schemas: Joi.Schema[] | Joi.Schema) => (req: Request, res: Response, next: NextFunction) => {
  const schemasArray = Array.isArray(schemas) ? schemas : [schemas];
  schemasArray.forEach((schema) => {
    const { error } = schema.validate(req, { allowUnknown: true });

    if (error) {
      throw new ValidationError(`Valiadation failed: ${error.message}`);
    }
  });

  next();
};

export const validateQuery = (innerSchema: Joi.Schema) => validate(Joi.object({ query: innerSchema }));

export const validateBody = (innerSchema: Joi.Schema) => validate(Joi.object({ body: innerSchema }));

export const validateParams = (innerSchema: Joi.Schema) => validate(Joi.object({ params: innerSchema }));

export const ipSchema = Joi.object({
  // Incorrect aliases cause error because validation runs after alias replacement
  ip: Joi.string().ip().error(new Error('Incorrect "ip" or "alias"')),
});

export const idSchema = Joi.object({
  id: Joi.string().required(),
});
