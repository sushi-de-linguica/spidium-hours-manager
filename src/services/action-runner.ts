import {
  EFileTagAction,
  EFileTagActionComponentsNightbot,
  EFileTagActionComponentsObs,
  EFileTagActionComponentsTwitch,
  EWsEvents,
  IFileTagActionModule,
  IFileTagNightbotModule,
  IFileTagObsModule,
  IFileTagTwitchModule,
  IMember,
  IRun,
} from "@/domain";
import { getBrowserLinkFromByMember } from "@/helpers/get-browser-link-from-member";
import { useConfigurationStore, useTwitch } from "@/stores";
import { TextGenerator } from "./file-exporter-service";
import { ipcRenderer } from "electron";
import { getTwitchLinkByMember } from "@/helpers/get-twitch-link-by-member";
import { NightbotApiService } from "./nightbot-service";
import { toast } from "react-toastify";
import { TwitchApiService } from "./twitch-service";

interface INightbotText {
  command: any;
  singular: string;
  plural: string;
  members: IMember[];
}

class ActionRunnerService {
  private actions: IFileTagActionModule[];
  private run: IRun;

  private runner: INightbotText;
  private host: INightbotText;
  private commentator: INightbotText;

  private title_template: string;

  constructor(actions: IFileTagActionModule[], run: IRun) {
    const enabledActions = actions.filter((action) => action.isEnabled);
    this.actions = enabledActions;
    this.run = run;

    const configurationState = useConfigurationStore.getState().state;

    this.runner = {
      command: configurationState.nightbot_runner_command_id,
      singular: configurationState.nightbot_runner_text_singular,
      plural: configurationState.nightbot_runner_text_plural,
      members: run.runners,
    };

    this.host = {
      command: configurationState.nightbot_host_command,
      singular: configurationState.nightbot_host_text_singular,
      plural: configurationState.nightbot_host_text_plural,
      members: run.hosts,
    };

    this.commentator = {
      command: configurationState.nightbot_commentator_command,
      singular: configurationState.nightbot_commentator_text_singular,
      plural: configurationState.nightbot_commentator_text_plural,
      members: run.comments,
    };

    this.title_template = configurationState.seo_title_template;
  }

  execute() {
    console.info("starting ActionRunnerService");
    if (this.actions.length === 0) {
      console.info("without actions to run");
      return;
    }

    const obsModules = this.getModulesByAction(EFileTagAction.OBS);
    const twitchModules = this.getModulesByAction(EFileTagAction.TWITCH);
    const nightbotModules = this.getModulesByAction(EFileTagAction.NIGHTBOT);

    console.info(`obs actions -> ${obsModules.length}`);
    console.info(`twitch actions -> ${twitchModules.length}`);
    console.info(`nightbot actions -> ${nightbotModules.length}`);

    this.handleRunObsActions(obsModules as IFileTagObsModule[]);
    this.handleRunNightbotActions(nightbotModules as IFileTagNightbotModule[]);
    this.handleRunTwitchActions(twitchModules as IFileTagTwitchModule[]);
  }

  private getModulesByAction(actionToGet: EFileTagAction) {
    return this.actions
      .filter(({ module: { action } }) => action === actionToGet)
      .map(({ module }) => module);
  }

  private handleRunObsActions(actions: IFileTagObsModule[]) {
    console.log("handleRunObsAction", actions);
    const batchRequests: any[] = [];

    const handleSetBrowserSource = (action: IFileTagObsModule) => {
      if (!action.resourceName) {
        return;
      }

      let url = "";

      if (action.value) {
        url = TextGenerator.generate(action.value, this.run);
      } else {
        const [firstRunner] = this.run.runners;
        if (!firstRunner) {
          return;
        }

        url = getBrowserLinkFromByMember(firstRunner);
      }

      batchRequests.push({
        requestType: "SetInputSettings",
        requestData: {
          inputName: action.resourceName,
          inputSettings: {
            url,
          },
        },
      });
    };

    const handleChangeScene = (action: IFileTagObsModule) => {
      if (!action.value) {
        return;
      }

      batchRequests.push({
        requestType: "SetCurrentProgramScene",
        requestData: {
          sceneName: action.value,
        },
      });
    };

    actions.forEach((act) => {
      switch (true) {
        case act.component === EFileTagActionComponentsObs.SET_BROWSER_SOURCE:
          handleSetBrowserSource(act);
          break;

        case act.component === EFileTagActionComponentsObs.CHANGE_SCENE:
          handleChangeScene(act);
          break;
      }
    });

    console.log("[OBS] batchRequests", batchRequests);
    if (batchRequests.length > 0) {
      ipcRenderer.send(EWsEvents.SEND_BATCH_EVENT_OBS, batchRequests);
    }
  }

  private handleRunNightbotActions(actions: IFileTagNightbotModule[]) {
    console.log("handleRunNightbotActions", actions);

    const nightbotConfigurations: any = {
      nightbot_runner_command_id: this.runner,
      nightbot_host_command: this.host,
      nightbot_commentator_command: this.commentator,
    };

    const getUpdateCommandToRun = (config: INightbotText) => {
      let message = "";

      if (config.members.length === 1) {
        const [member] = config.members;
        message = `${config.singular ?? ""}`;
        message += getTwitchLinkByMember(member);
        return message;
      }

      const mappedLinks = config.members.map((member) =>
        getTwitchLinkByMember(member)
      );
      message = `${config.plural ?? ""}`;
      message += mappedLinks.join(" | ");

      return message;
    };

    const handleUpdateCommand = (module: IFileTagNightbotModule) => {
      const config: any =
        nightbotConfigurations[module.configurationCommandField];

      if (!config) {
        return;
      }

      const needUpdateCommand = config.command && config.members?.length > 0;

      if (needUpdateCommand) {
        const message = getUpdateCommandToRun(config);

        const nightbotService = new NightbotApiService();

        nightbotService
          .updateCustomCommandById(config.command._id, {
            message,
          })
          .then(() => {
            toast.success(
              `O comando ${config.command.name} foi atualizado no nightbot`
            );
          });
      }
    };

    actions.forEach((action) => {
      switch (true) {
        case action.component ===
          EFileTagActionComponentsNightbot.UPDATE_COMMAND:
          handleUpdateCommand(action);
          break;
      }
    });
  }

  private async handleRunTwitchActions(actions: IFileTagTwitchModule[]) {
    console.log("handleRunTwitchActions", actions);
    const twitchStore = useTwitch.getState().state;

    const handleUpdateTitle = async (module: IFileTagTwitchModule) => {
      try {
        const title = this.getRunTitle(this.run, module);

        const twitchService = new TwitchApiService(twitchStore.broadcaster_id);

        await twitchService
          .updateChannel({
            title,
          })
          .then(() => {
            toast.success("Titulo da live atualizado");
          })
          .catch(() => {
            toast.error("Erro ao atualizar o titulo da live");
          });
      } catch (error) {
        console.error("[erro] ao atualizar o titulo na twitch", error);
      }
    };

    const handleUpdateGame = async (module: IFileTagTwitchModule) => {
      try {
        const gameName = this.getRunGame(this.run);

        const twitchService = new TwitchApiService(twitchStore.broadcaster_id);

        const response = await twitchService.getGameByName(gameName);

        const game = response.data?.data[0];

        if (game) {
          twitchService
            .updateChannel({
              game_id: game.id,
            })
            .then(() => {
              toast.success("Jogo da live atualizado");
            })
            .catch(() => {
              toast.error("Erro ao atualizar jogo da live");
            });
        }
      } catch (error) {
        console.error("[erro] ao atualizar o jogo na twitch", error);
      }
    };

    for (const action of actions) {
      switch (true) {
        case action.component === EFileTagActionComponentsTwitch.UPDATE_TITLE:
          await handleUpdateTitle(action);
          break;

        case action.component === EFileTagActionComponentsTwitch.UPDATE_GAME:
          await handleUpdateGame(action);
          break;
      }
    }
  }

  private getRunTitle(run: IRun, module: IFileTagTwitchModule) {
    const getTemplate = () => {
      const hasCustomTemplate = run?.seoTitle && run?.seoTitle?.length > 0;
      if (hasCustomTemplate) {
        return run.seoTitle!;
      }

      const hasModuleTemplate = module.value && module.value.length > 0;
      if (hasModuleTemplate) {
        return module.value;
      }

      return this.title_template;
    };

    const template = getTemplate();
    return TextGenerator.generate(template, run);
  }

  private getRunGame(run: IRun) {
    const hasCustomGame = run.seoGame && run?.seoGame?.length > 0;

    return hasCustomGame ? run.seoGame! : run.game;
  }
}

export { ActionRunnerService };
