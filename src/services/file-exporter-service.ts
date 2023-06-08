import { IExportFileRun, IRun } from "@/domain";
import * as fs from "fs";

const REGEX = {
  LOOP_REGEX: /<loop property='(.*?)' separator='(.*?)'>(.*?)<\/loop>/,
  ITEM_REGEX: /<item property='(.*?)' index='(.*?)'>(.*?)<\/item>/,
};

class TextGenerator {
  public static generate(
    template: string,
    data: IRun,
    maxCharsPerLine?: number
  ): string {
    let output = template;

    const loopMatch = template.match(REGEX.LOOP_REGEX);
    if (loopMatch) {
      output = this.handleLoopMatch(loopMatch, output, data);
    }

    const itemMatch = template.match(REGEX.ITEM_REGEX);
    if (itemMatch) {
      output = this.handleItemMatch(itemMatch, output, data);
    }

    output = this.handlePlaceholderMatch(output, data);

    if (maxCharsPerLine && maxCharsPerLine > 0) {
      output = this.breakIntoLines(output, maxCharsPerLine);
    }

    return output;
  }

  private static handleLoopMatch(
    loopMatch: RegExpMatchArray,
    output: string,
    data: IRun
  ): string {
    const [, property, separator, content] = loopMatch;
    const loopItems = data[property];

    const loopOutput = loopItems
      ?.map((item: any) => {
        return content.replace(/\{(.*?)\[(.*?)\]\}/g, (_, p1, p2) => {
          return item[p2] ?? "";
        });
      })
      .join(separator);

    return output.replace(loopMatch[0], loopOutput ?? "");
  }

  private static handleItemMatch(
    itemMatch: RegExpMatchArray,
    output: string,
    data: IRun
  ): string {
    const [, property, index, content] = itemMatch;
    const item = data[property][parseInt(index)] as any;

    const itemOutput = content.replace(/\{(.*?)\[(.*?)\]\}/g, (_, p1, p2) => {
      return item && p2 ? item[p2] : "";
    });

    return output.replace(itemMatch[0], itemOutput ?? "");
  }

  private static handlePlaceholderMatch(output: string, data: IRun): string {
    return output.replace(/\{(.*?)\}/g, (_, p1) => data[p1 as keyof IRun]);
  }

  private static breakIntoLines(
    input: string,
    maxCharsPerLine: number
  ): string {
    const lines: string[] = [];

    let currentLine = "";

    for (const word of input.split(" ")) {
      if (currentLine.length + word.length > maxCharsPerLine) {
        lines.push(currentLine.trim());
        currentLine = "";
      }

      currentLine += `${word} `;
    }

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines.join("\n");
  }
}

class FileExporter {
  public static exportFilesToPath(
    files: IExportFileRun[],
    path: string,
    data: IRun
  ): void {
    files.forEach((file) => {
      const output = TextGenerator.generate(
        file.template,
        data,
        file.maxCharsPerLine
      );
      fs.writeFileSync(`${path}/${file.name}`, output ?? "");
    });
  }
}

export { FileExporter, TextGenerator };
