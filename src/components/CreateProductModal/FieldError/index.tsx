import type { FieldErrorProps } from './types';

export const FieldError = ({ message }: FieldErrorProps) => {
  if (!message) return null;
  return <p className="text-xs text-danger-500 mt-1">{message}</p>;
};
