import {
  IObsToggleVisibilityBatchData,
  IObsToggleVisibilityResult,
  isToggleVisibilityChain,
} from "../../src/helpers/obs-toggle-visibility-batch";

export type { IObsToggleVisibilityBatchData, IObsToggleVisibilityResult };

type ObsCall = (requestType: string, requestData?: unknown) => Promise<unknown>;

function formatObsError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return String(error);
}

export async function toggleSceneItemVisibilityV5(
  call: ObsCall,
  { sceneName, sourceName }: IObsToggleVisibilityBatchData
): Promise<IObsToggleVisibilityResult> {
  const scene = sceneName.trim();
  const source = sourceName.trim();

  console.info("[obs] GetSceneItemId", { sceneName: scene, sourceName: source });

  let sceneItemId: number;

  try {
    const response = (await call("GetSceneItemId", {
      sceneName: scene,
      sourceName: source,
    })) as { sceneItemId: number };
    sceneItemId = response.sceneItemId;
  } catch (error) {
    throw new Error(
      `Item "${source}" não encontrado na cena "${scene}". Verifique os nomes exatos no OBS. (${formatObsError(error)})`
    );
  }

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

export async function toggleSceneItemVisibilityV4(
  send: ObsCall,
  { sceneName, sourceName }: IObsToggleVisibilityBatchData
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

  console.info("[obs] SetSceneItemProperties (toggle v4)", {
    sceneName: scene,
    sourceName: source,
    was: currentVisible,
    now: nextVisible,
  });

  try {
    await send("SetSceneItemProperties", {
      "scene-name": scene,
      item: source,
      visible: nextVisible,
    });
    return { sceneItemEnabled: nextVisible };
  } catch (error) {
    throw new Error(
      `Falha ao alterar visibilidade de "${source}" na cena "${scene}" (OBS v4). (${formatObsError(error)})`
    );
  }
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
      data: IObsToggleVisibilityBatchData
    ) => Promise<IObsToggleVisibilityResult>;
    onToggleVisibilityV4: (
      data: IObsToggleVisibilityBatchData
    ) => Promise<IObsToggleVisibilityResult>;
    onBatchable: (requests: ObsBatchRequest[]) => Promise<unknown>;
    useV4: boolean;
  }
): Promise<unknown> {
  const batchable: ObsBatchRequest[] = [];
  const toggleResults: IObsToggleVisibilityResult[] = [];

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    const next = requests[i + 1];

    if (isToggleVisibilityChain(request, next as Parameters<typeof isToggleVisibilityChain>[1])) {
      const getData = request.requestData as {
        sceneName: string;
        sourceName: string;
      };

      const data: IObsToggleVisibilityBatchData = {
        sceneName: getData.sceneName,
        sourceName: getData.sourceName,
      };

      console.info("[obs] toggle visibility chain", data, {
        protocol: handlers.useV4 ? "v4" : "v5",
      });

      const result = handlers.useV4
        ? await handlers.onToggleVisibilityV4(data)
        : await handlers.onToggleVisibilityV5(data);

      toggleResults.push(result);
      i++;
      continue;
    }

    batchable.push(request);
  }

  const batchResult =
    batchable.length > 0 ? await handlers.onBatchable(batchable) : [];

  if (toggleResults.length === 1) {
    return toggleResults[0];
  }

  if (toggleResults.length > 1) {
    return { toggled: toggleResults };
  }

  return batchResult;
}
