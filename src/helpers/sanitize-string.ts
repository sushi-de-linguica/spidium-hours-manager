const sanitizeString = (str: string) => {
  if (str === undefined || str === null) {
    return "";
  }

  return str.replace(/[^a-zA-Z0-9_-]/g, "");
};

export { sanitizeString };
