import Joi from 'joi';
import { KnownApp } from 'rtv-client';

const aliasSchema = Joi.string().required();

export const validateApp = ({ row }: { row: KnownApp }) => {
  const result: Record<string, string> = {};

  const { error: aliasError } = aliasSchema.validate(row.alias);
  if (aliasError) {
    result.alias = 'Please enter alias';
  }

  return result;
};
