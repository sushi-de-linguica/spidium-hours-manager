import { randomUUID } from "crypto";
import { EFileTagAction, EFileTagActionComponentsExportFiles, EFileTagActionComponentsNightbot, EFileTagActionComponentsObs, EFileTagActionComponentsTwitch } from "@/domain/enums";
import { IFileTag } from "@/domain";

const DEFAULT_ACTIONS: IFileTag[] = [
  {
    "id": "",
    "actions": [
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.EXPORT_FILES,
          "component": EFileTagActionComponentsExportFiles.EXPORT_ALL,
          "value": "D:\\SHMV1\\4x3"
        },
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.NIGHTBOT,
          "component": EFileTagActionComponentsNightbot.UPDATE_COMMAND,
          "configurationCommandField": "nightbot_runner_command_id",
          "template": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.NIGHTBOT,
          "component": EFileTagActionComponentsNightbot.UPDATE_COMMAND,
          "configurationCommandField": "nightbot_host_command",
          "template": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.NIGHTBOT,
          "component": EFileTagActionComponentsNightbot.UPDATE_COMMAND,
          "configurationCommandField": "nightbot_commentator_command",
          "template": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.TWITCH,
          "component": EFileTagActionComponentsTwitch.UPDATE_TITLE,
          "value": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.TWITCH,
          "component": EFileTagActionComponentsTwitch.UPDATE_GAME,
          "value": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='0'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-1-4x3-feed"
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='1'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-2-4x3-feed"
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='2'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-3-4x3-feed"
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='3'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-4-4x3-feed"
        }
      }
    ],
    "label": "4:3",
    "description": "Envia informações para tela de LIVE (4:3)",
    "path": "",
    "variant": "solid",
    "color": "green",
    "minimumRunnersToShow": 0,
    "isRequiredConfirmation": true,
    "isShow": true
  },
  {
    "id": "",
    "actions": [
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.EXPORT_FILES,
          "component": EFileTagActionComponentsExportFiles.EXPORT_ALL,
          "value": "D:\\SHMV1\\16x9"
        },
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.NIGHTBOT,
          "component": EFileTagActionComponentsNightbot.UPDATE_COMMAND,
          "configurationCommandField": "nightbot_runner_command_id",
          "template": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.NIGHTBOT,
          "component": EFileTagActionComponentsNightbot.UPDATE_COMMAND,
          "configurationCommandField": "nightbot_host_command",
          "template": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.NIGHTBOT,
          "component": EFileTagActionComponentsNightbot.UPDATE_COMMAND,
          "configurationCommandField": "nightbot_commentator_command",
          "template": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.TWITCH,
          "component": EFileTagActionComponentsTwitch.UPDATE_TITLE,
          "value": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.TWITCH,
          "component": EFileTagActionComponentsTwitch.UPDATE_GAME,
          "value": ""
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='0'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-1-16x9-feed"
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='1'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-2-16x9-feed"
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='2'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-3-16x9-feed"
        }
      },
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.OBS,
          "component": EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
          "value": "https://player.twitch.tv/?channel=<item property='runners' index='3'>{runners[streamAt]}</item>&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv",
          "resourceName": "player-4-16x9-feed"
        }
      }
    ],
    "label": "16:9",
    "description": "Envia informações para tela de LIVE (16:9)",
    "path": "",
    "variant": "solid",
    "color": "purple",
    "minimumRunnersToShow": 0,
    "isRequiredConfirmation": true,
    "isShow": true
  },
  {
    "id": "",
    "actions": [
      {
        "isEnabled": true,
        "module": {
          "action": EFileTagAction.EXPORT_FILES,
          "component": EFileTagActionComponentsExportFiles.EXPORT_ALL,
          "value": "D:\\SHMV1\\setup"
        }
      }
    ],
    "label": "Setup",
    "description": "Envia informações para tela de SETUP",
    "path": "",
    "variant": "solid",
    "color": "blue",
    "minimumRunnersToShow": 0,
    "isRequiredConfirmation": false,
    "isShow": true
  }
];

export const getDefaultActionButtons = (): IFileTag[] => {
  return DEFAULT_ACTIONS.map((actionButton) => {
    if (!actionButton.id) {
      return {
        ...actionButton,
        id: randomUUID(),
      }
    }

    return actionButton;
  });
}