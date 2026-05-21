import { IObsToggleAudioMuteBatchData, IObsToggleAudioMuteResult } from "../../src/helpers/obs-toggle-audio-mute-batch";

type ObsCall = (requestType: string, requestData?: unknown) => Promise<unknown>;

function formatObsError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return String(error);
}

export async function toggleAudioMuteV5(
  call: ObsCall,
  { inputName }: IObsToggleAudioMuteBatchData
): Promise<IObsToggleAudioMuteResult> {
  const input = inputName.trim();

  console.info("[obs] ToggleInputMute", { inputName: input });

  try {
    const response = (await call("ToggleInputMute", {
      inputName: input,
    })) as { inputMuted: boolean };

    return { inputMuted: response.inputMuted };
  } catch (error) {
    throw new Error(
      `Falha ao alternar mute do áudio "${input}". Verifique o nome do input no OBS. (${formatObsError(error)})`
    );
  }
}

export async function toggleAudioMuteV4(
  send: ObsCall,
  { inputName }: IObsToggleAudioMuteBatchData
): Promise<IObsToggleAudioMuteResult> {
  const source = inputName.trim();

  console.info("[obs] ToggleMute (v4)", { source });

  try {
    await send("ToggleMute", { source });
  } catch (error) {
    throw new Error(
      `Falha ao alternar mute do áudio "${source}" (OBS v4). (${formatObsError(error)})`
    );
  }

  try {
    const response = (await send("GetMute", { source })) as { muted: boolean };
    return { inputMuted: response.muted };
  } catch (error) {
    throw new Error(
      `Mute alternado, mas falha ao ler estado de "${source}". (${formatObsError(error)})`
    );
  }
}
