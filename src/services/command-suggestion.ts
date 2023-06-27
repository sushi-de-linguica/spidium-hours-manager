import { IRun } from "@/domain";
import { TextGenerator } from "./file-exporter-service";

class CommandSuggestionService {
  static getTitleByRun(template: string, run: IRun) {
    const hasCustomTemplate = run?.seoTitle && run?.seoTitle?.length > 0;

    return TextGenerator.generate(
      hasCustomTemplate ? run.seoTitle! : template,
      run
    );
  }

  static getGameByRun(run: IRun) {
    const hasCustomGame = run.seoGame && run?.seoGame?.length > 0;

    return hasCustomGame ? run.seoGame! : run.game;
  }

  static getGameAndTitle(template: string, runs: IRun[]) {
    return runs.map((run) => ({
      title: this.getTitleByRun(template, run),
      game: this.getGameByRun(run),
    }));
  }
}

export { CommandSuggestionService };
