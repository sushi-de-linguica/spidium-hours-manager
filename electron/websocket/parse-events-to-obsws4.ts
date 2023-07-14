import { IObsWsEventSetInputSettings } from "./interfaces";

// https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md
// SetCurrentProgramScene -> { "requestData" : { "sceneName": "nome_da_cena" } }

const handleParseEventsToOBSWS4 = (
  requests: IObsWsEventSetInputSettings[]
): IObsWsEventSetInputSettings[] => {
  const response = requests
    .map(({ requestType, requestData }) => {
      switch (requestType) {
        case "SetInputSettings":
          return {
            requestType: "SetSourceSettings",
            requestData: {
              sourceName: requestData.inputName,
              sourceSettings: requestData.inputSettings,
            },
          };

        case "SetCurrentProgramScene":
          return {
            requestType: "SetCurrentScene",
            requestData: {
              "scene-name": requestData.sceneName,
            },
          };
        default:
          return null;
      }
    })
    .filter((request) => !!request);

  return response as unknown as IObsWsEventSetInputSettings[];
};

export { handleParseEventsToOBSWS4 };
