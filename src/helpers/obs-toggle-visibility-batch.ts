/** Marks SetSceneItemEnabled as chained after GetSceneItemId */
export const OBS_REQUIRES_SCENE_ITEM_ID = "requiresSceneItemId";

export interface IObsSceneItemVisibilityBatchData {
  sceneName: string;
  sourceName: string;
}

export interface IObsSetSceneItemVisibilityBatchData
  extends IObsSceneItemVisibilityBatchData {
  sceneItemEnabled: boolean;
}

export interface IObsToggleVisibilityResult {
  sceneItemEnabled: boolean;
}

function buildSceneItemVisibilityChain(
  sceneName: string,
  sourceName: string,
  sceneItemEnabled?: boolean
) {
  return [
    {
      requestType: "GetSceneItemId",
      requestData: {
        sceneName,
        sourceName,
      },
    },
    {
      requestType: "SetSceneItemEnabled",
      requestData: {
        sceneName,
        ...(sceneItemEnabled !== undefined ? { sceneItemEnabled } : {}),
      },
      [OBS_REQUIRES_SCENE_ITEM_ID]: true,
    },
  ];
}

export function buildToggleSceneItemVisibilityBatchRequests(
  data: IObsSceneItemVisibilityBatchData
) {
  return buildSceneItemVisibilityChain(data.sceneName, data.sourceName);
}

export function buildSetSceneItemVisibilityBatchRequests(
  data: IObsSetSceneItemVisibilityBatchData
) {
  return buildSceneItemVisibilityChain(
    data.sceneName,
    data.sourceName,
    data.sceneItemEnabled
  );
}

type SetSceneItemEnabledRequestData = {
  sceneItemId?: number;
  sceneItemEnabled?: boolean;
};

export function isSceneItemVisibilityChain(
  request: { requestType: string },
  next?: {
    requestType: string;
    requestData?: SetSceneItemEnabledRequestData;
    [OBS_REQUIRES_SCENE_ITEM_ID]?: boolean;
  }
): boolean {
  if (request.requestType !== "GetSceneItemId") {
    return false;
  }

  if (next?.requestType !== "SetSceneItemEnabled") {
    return false;
  }

  return (
    next[OBS_REQUIRES_SCENE_ITEM_ID] === true ||
    next.requestData?.sceneItemId === undefined
  );
}

export function isToggleVisibilityChain(
  request: { requestType: string },
  next?: Parameters<typeof isSceneItemVisibilityChain>[1]
): boolean {
  if (!isSceneItemVisibilityChain(request, next)) {
    return false;
  }

  return typeof next?.requestData?.sceneItemEnabled !== "boolean";
}

export function isForceVisibilityChain(
  request: { requestType: string },
  next?: Parameters<typeof isSceneItemVisibilityChain>[1]
): boolean {
  if (!isSceneItemVisibilityChain(request, next)) {
    return false;
  }

  return typeof next?.requestData?.sceneItemEnabled === "boolean";
}
