const sanitizeString = (str: string) => {
  return str.replace(/[^a-zA-Z0-9_-]/g, "");
};

export { sanitizeString };
