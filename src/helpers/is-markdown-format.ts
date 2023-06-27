function isMarkdownFormat(str: string) {
  if (/\[.+\]\(.+\)/.test(str)) {
    return true;
  }

  return false;
}

export { isMarkdownFormat };
