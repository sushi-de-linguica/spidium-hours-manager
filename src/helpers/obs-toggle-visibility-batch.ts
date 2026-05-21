/** Marks SetSceneItemEnabled as chained after GetSceneItemId (flip current visibility) */
export const OBS_REQUIRES_SCENE_ITEM_ID = "requiresSceneItemId";

export interface IObsToggleVisibilityBatchData {
  sceneName: string;
  sourceName: string;
}

export interface IObsToggleVisibilityResult {
  sceneItemEnabled: boolean;
}

export function buildToggleSceneItemVisibilityBatchRequests(
  data: IObsToggleVisibilityBatchData
) {
  return [
    {
      requestType: "GetSceneItemId",
      requestData: {
        sceneName: data.sceneName,
        sourceName: data.sourceName,
      },
    },
    {
      requestType: "SetSceneItemEnabled",
      requestData: {
        sceneName: data.sceneName,
      },
      [OBS_REQUIRES_SCENE_ITEM_ID]: true,
    },
  ];
}

export function isToggleVisibilityChain(
  request: { requestType: string },
  next?: {
    requestType: string;
    requestData?: { sceneItemId?: number };
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
