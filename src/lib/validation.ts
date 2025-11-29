export const isValidEmail = {
  regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
};

export const hasMinLength = (value: string, min: number) => value.trim().length >= min;
