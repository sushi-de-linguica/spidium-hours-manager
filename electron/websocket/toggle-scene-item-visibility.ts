import { isToggleAudioMuteRequest } from "../../src/helpers/obs-toggle-audio-mute-batch";
import {
  IObsSceneItemVisibilityBatchData,
  IObsToggleVisibilityResult,
  isForceVisibilityChain,
  isToggleVisibilityChain,
} from "../../src/helpers/obs-toggle-visibility-batch";
import {
  IObsToggleAudioMuteBatchData,
  IObsToggleAudioMuteResult,
} from "../../src/helpers/obs-toggle-audio-mute-batch";

export type {
  IObsSceneItemVisibilityBatchData,
  IObsToggleVisibilityResult,
  IObsToggleAudioMuteBatchData,
  IObsToggleAudioMuteResult,
};

type ObsCall = (requestType: string, requestData?: unknown) => Promise<unknown>;

function formatObsError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return String(error);
}

async function resolveSceneItemIdV5(
  call: ObsCall,
  scene: string,
  source: string
): Promise<number> {
  try {
    const response = (await call("GetSceneItemId", {
      sceneName: scene,
      sourceName: source,
    })) as { sceneItemId: number };
    return response.sceneItemId;
  } catch (error) {
    throw new Error(
      `Item "${source}" não encontrado na cena "${scene}". Verifique os nomes exatos no OBS. (${formatObsError(error)})`
    );
  }
}

export async function setSceneItemVisibilityV5(
  call: ObsCall,
  {
    sceneName,
    sourceName,
    sceneItemEnabled,
  }: IObsSceneItemVisibilityBatchData & { sceneItemEnabled: boolean }
): Promise<IObsToggleVisibilityResult> {
  const scene = sceneName.trim();
  const source = sourceName.trim();

  console.info("[obs] GetSceneItemId", { sceneName: scene, sourceName: source });

  const sceneItemId = await resolveSceneItemIdV5(call, scene, source);

  console.info("[obs] SetSceneItemEnabled (force)", {
    sceneName: scene,
    sceneItemId,
    sceneItemEnabled,
  });

  try {
    await call("SetSceneItemEnabled", {
      sceneName: scene,
      sceneItemId,
      sceneItemEnabled,
    });
    return { sceneItemEnabled };
  } catch (error) {
    throw new Error(
      `Falha ao definir visibilidade de "${source}" na cena "${scene}". (${formatObsError(error)})`
    );
  }
}

export async function toggleSceneItemVisibilityV5(
  call: ObsCall,
  { sceneName, sourceName }: IObsSceneItemVisibilityBatchData
): Promise<IObsToggleVisibilityResult> {
  const scene = sceneName.trim();
  const source = sourceName.trim();

  const sceneItemId = await resolveSceneItemIdV5(call, scene, source);

  let currentEnabled: boolean;

  try {
    const enabledResponse = (await call("GetSceneItemEnabled", {
      sceneName: scene,
      sceneItemId,
    })) as { sceneItemEnabled: boolean };
    currentEnabled = enabledResponse.sceneItemEnabled;
  } catch (error) {
    throw new Error(
      `Falha ao ler visibilidade de "${source}" na cena "${scene}". (${formatObsError(error)})`
    );
  }

  const nextEnabled = !currentEnabled;

  console.info("[obs] SetSceneItemEnabled (toggle)", {
    sceneName: scene,
    sceneItemId,
    was: currentEnabled,
    now: nextEnabled,
  });

  try {
    await call("SetSceneItemEnabled", {
      sceneName: scene,
      sceneItemId,
      sceneItemEnabled: nextEnabled,
    });
    return { sceneItemEnabled: nextEnabled };
  } catch (error) {
    throw new Error(
      `Falha ao alterar visibilidade de "${source}" na cena "${scene}". (${formatObsError(error)})`
    );
  }
}

export async function setSceneItemVisibilityV4(
  send: ObsCall,
  {
    sceneName,
    sourceName,
    sceneItemEnabled,
  }: IObsSceneItemVisibilityBatchData & { sceneItemEnabled: boolean }
): Promise<IObsToggleVisibilityResult> {
  const scene = sceneName.trim();
  const source = sourceName.trim();

  console.info("[obs] SetSceneItemProperties (force v4)", {
    sceneName: scene,
    sourceName: source,
    visible: sceneItemEnabled,
  });

  try {
    await send("SetSceneItemProperties", {
      "scene-name": scene,
      item: source,
      visible: sceneItemEnabled,
    });
    return { sceneItemEnabled };
  } catch (error) {
    throw new Error(
      `Falha ao definir visibilidade de "${source}" na cena "${scene}" (OBS v4). (${formatObsError(error)})`
    );
  }
}

export async function toggleSceneItemVisibilityV4(
  send: ObsCall,
  { sceneName, sourceName }: IObsSceneItemVisibilityBatchData
): Promise<IObsToggleVisibilityResult> {
  const scene = sceneName.trim();
  const source = sourceName.trim();

  let currentVisible: boolean;

  try {
    const props = (await send("GetSceneItemProperties", {
      "scene-name": scene,
      item: source,
    })) as { visible?: boolean };
    currentVisible = props.visible ?? true;
  } catch (error) {
    throw new Error(
      `Item "${source}" não encontrado na cena "${scene}" (OBS v4). (${formatObsError(error)})`
    );
  }

  const nextVisible = !currentVisible;

  return setSceneItemVisibilityV4(send, {
    sceneName: scene,
    sourceName: source,
    sceneItemEnabled: nextVisible,
  });
}

type ObsBatchRequest = {
  requestType: string;
  requestData?: unknown;
  requiresSceneItemId?: boolean;
};

export async function processObsBatchRequests(
  requests: ObsBatchRequest[],
  handlers: {
    onToggleVisibilityV5: (
      data: IObsSceneItemVisibilityBatchData
    ) => Promise<IObsToggleVisibilityResult>;
    onToggleVisibilityV4: (
      data: IObsSceneItemVisibilityBatchData
    ) => Promise<IObsToggleVisibilityResult>;
    onSetVisibilityV5: (
      data: IObsSceneItemVisibilityBatchData & { sceneItemEnabled: boolean }
    ) => Promise<IObsToggleVisibilityResult>;
    onSetVisibilityV4: (
      data: IObsSceneItemVisibilityBatchData & { sceneItemEnabled: boolean }
    ) => Promise<IObsToggleVisibilityResult>;
    onToggleAudioMuteV5: (
      data: IObsToggleAudioMuteBatchData
    ) => Promise<IObsToggleAudioMuteResult>;
    onToggleAudioMuteV4: (
      data: IObsToggleAudioMuteBatchData
    ) => Promise<IObsToggleAudioMuteResult>;
    onBatchable: (requests: ObsBatchRequest[]) => Promise<unknown>;
    useV4: boolean;
  }
): Promise<unknown> {
  const batchable: ObsBatchRequest[] = [];
  const specialResults: Array<
    IObsToggleVisibilityResult | IObsToggleAudioMuteResult
  > = [];

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    const next = requests[i + 1];

    if (isToggleAudioMuteRequest(request)) {
      const { inputName } = request.requestData as { inputName: string };
      const data: IObsToggleAudioMuteBatchData = { inputName };

      console.info("[obs] toggle audio mute", data, {
        protocol: handlers.useV4 ? "v4" : "v5",
      });

      const result = handlers.useV4
        ? await handlers.onToggleAudioMuteV4(data)
        : await handlers.onToggleAudioMuteV5(data);

      specialResults.push(result);
      continue;
    }

    if (
      isForceVisibilityChain(
        request,
        next as Parameters<typeof isForceVisibilityChain>[1]
      )
    ) {
      const getData = request.requestData as {
        sceneName: string;
        sourceName: string;
      };
      const setData = next!.requestData as { sceneItemEnabled: boolean };

      const data = {
        sceneName: getData.sceneName,
        sourceName: getData.sourceName,
        sceneItemEnabled: setData.sceneItemEnabled,
      };

      console.info("[obs] force visibility chain", data, {
        protocol: handlers.useV4 ? "v4" : "v5",
      });

      const result = handlers.useV4
        ? await handlers.onSetVisibilityV4(data)
        : await handlers.onSetVisibilityV5(data);

      specialResults.push(result);
      i++;
      continue;
    }

    if (
      isToggleVisibilityChain(
        request,
        next as Parameters<typeof isToggleVisibilityChain>[1]
      )
    ) {
      const getData = request.requestData as {
        sceneName: string;
        sourceName: string;
      };

      const data: IObsSceneItemVisibilityBatchData = {
        sceneName: getData.sceneName,
        sourceName: getData.sourceName,
      };

      console.info("[obs] toggle visibility chain", data, {
        protocol: handlers.useV4 ? "v4" : "v5",
      });

      const result = handlers.useV4
        ? await handlers.onToggleVisibilityV4(data)
        : await handlers.onToggleVisibilityV5(data);

      specialResults.push(result);
      i++;
      continue;
    }

    batchable.push(request);
  }

  const batchResult =
    batchable.length > 0 ? await handlers.onBatchable(batchable) : [];

  if (specialResults.length === 1) {
    return specialResults[0];
  }

  if (specialResults.length > 1) {
    return { results: specialResults };
  }

  return batchResult;
}
