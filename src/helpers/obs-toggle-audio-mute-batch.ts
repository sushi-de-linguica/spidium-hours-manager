export interface IObsToggleAudioMuteBatchData {
  inputName: string;
}

export interface IObsToggleAudioMuteResult {
  inputMuted: boolean;
}

export function buildToggleAudioMuteBatchRequests(
  data: IObsToggleAudioMuteBatchData
) {
  return [
    {
      requestType: "ToggleInputMute",
      requestData: {
        inputName: data.inputName,
      },
    },
  ];
}

export function isToggleAudioMuteRequest(request: {
  requestType: string;
}): boolean {
  return request.requestType === "ToggleInputMute";
}
