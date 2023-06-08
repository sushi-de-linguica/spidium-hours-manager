import { IObsWsEventSetInputSettings } from "./interfaces";

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
        default:
          return null;
      }
    })
    .filter((request) => !!request);

  return response as unknown as IObsWsEventSetInputSettings[];
};

export { handleParseEventsToOBSWS4 };
