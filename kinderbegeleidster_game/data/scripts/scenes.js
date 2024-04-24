export const scenes = [
  {
    sceneNum: 1,
    sceneName : 'map-scene',
    chars_participating : [3,4,5,6,7,8,9,10],
    sceneContainerCharacter : 3,
    areaContainerCharacter : [5,6,7],
    fieldContainerCharacter : [4,8,9,10]
  },
  {
    sceneNum: 2,
    sceneName: 'main-scene',
    chars_participating : [1,4,10,11,12,13,14,15,16,17,18,21],
    sceneContainerCharacter : 11,
    areaContainerCharacter : [4,12,13,14,21],
    fieldContainerCharacter : [1,10],
    relevant_chars_shop_inside : [11,21],
    school_area_items : [1,2,3]
  },
  {
    sceneNum: 3,
    sceneName: 'sub-scene',
    chars_participating : [1,3,6,7,11]
  }
];