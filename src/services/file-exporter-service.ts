import { IExportFileRun, IRun } from "@/domain";
import * as fs from "fs";
import * as os from "os";

const REGEX = {
  LOOP_REGEX:
    /<loop property='(.*?)' separator='(.*?)' prefix='(.+)?'>(.*?)<\/loop>/,
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

    try {
      const outputWithBreakLines = this.breakLinesReplace(output);
      output = outputWithBreakLines;
    } catch (error) {
      console.log("error at try apply break lines", error);
    }

    return output;
  }

  private static getFirstFieldFromItem(
    item: any,
    property: any,
    prefix: string[]
  ) {
    const fields = property.indexOf(",") >= 0 ? property.split(",") : [];

    if (fields.length === 0 && property) {
      fields.push(property);
    }

    if (!property || !item) {
      return "";
    }

    let value = "";

    const hasPrefixes = prefix && prefix.length > 0;

    fields.forEach((field: any, index: number) => {
      const currentValue = item[field];

      if (!currentValue || value) {
        return;
      }

      let prefixValue = hasPrefixes && prefix[index] ? prefix[index] : "";

      value = `${prefixValue}${currentValue}`;
    });

    return value ? value : "";
  }

  private static handleLoopMatch(
    loopMatch: RegExpMatchArray,
    output: string,
    data: IRun
  ): string {
    const [, property, separator, prefix, content] = loopMatch;
    const loopItems = data[property];

    const loopOutput = loopItems
      ?.map((item: any) => {
        const prefixList = prefix && prefix.length > 0 ? prefix.split(",") : [];
        return content.replace(/{(.*?)\[(.*?)\]\}/g, (_, p1, p2) => {
          return TextGenerator.getFirstFieldFromItem(item, p2, prefixList);
        });
      })
      .join(separator);

    console.log("loopOutput", loopOutput);

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
      const value = TextGenerator.getFirstFieldFromItem(item, p2, []);
      return value;
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

  private static breakLinesReplace(output: string) {
    return output
      .replaceAll("\\r\\n", "\\n")
      .replaceAll("\\r", "\\n")
      .replaceAll("\\n", os.EOL);
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
