import { isMarkdownFormat } from "./is-markdown-format";

const REGEX = /\[(.*?)\]\((.*?)\)/g;

const getMDString = (value: string): string[] | any[] => {
  const hasMemberToExport = isMarkdownFormat(value);

  if (hasMemberToExport) {
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
  }

  return [
    {
      text: value,
      value: null,
    },
  ];
};

export { getMDString };
