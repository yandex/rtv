/*
 * Creates FormData and sets not undefined fields. Values are converted in strings
 */
import FormData from 'form-data';

export const createFormData = (fields: Record<string, boolean | number | string | undefined>) => {
  const formData = new FormData();

  Object.keys(fields).forEach((fieldName) => {
    const value = fields[fieldName];
    if (value !== undefined) {
      formData.append(fieldName, value.toString());
    }
  });

  return formData;
};
