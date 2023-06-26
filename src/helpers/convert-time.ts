function padNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

const convertTime = (timeString: string): string => {
  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const matches = timeString.match(regex);

  if (!matches) {
    throw new Error("Formato de tempo inválido");
  }

  const [, hours, minutes, seconds] = matches;

  const formattedHours = hours ? padNumber(parseInt(hours, 10)) : "00";
  const formattedMinutes = minutes ? padNumber(parseInt(minutes, 10)) : "00";
  const formattedSeconds = seconds ? padNumber(parseInt(seconds, 10)) : "00";

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export { convertTime };
