const REGEX = /\[(.*?)\]\((.*?)\)/g;

const getMDString = (value: string) => {
  const matches = [...value.matchAll(REGEX)];
  const results = matches.map((match) => {
    const text = match[1];
    const value = match[2];

    return {
      text,
      value,
    };
  });

  return results;
};

export { getMDString };
