import { chars } from "./data/scripts/chars.js";
import {scenes} from "./data/scripts/scenes.js";
import {map_group} from "./data/scripts/map_group.js";
import {map_participants} from "./data/scripts/map_participants.js";
import {manufactureElement} from "./data/scripts/manufactureElement.js";
import {charPosition} from "./data/scripts/charPosition.js";
import {fetchRelevantNodsBuildingInside} from './data/scripts/hidableNodsBuildingInside.js';
import {items} from './data/items.js';
import {inventory} from './data/inventory.js';
/* 
- we need to keep track if map areas are lock or not
- we need to keep track which area the user is currently on
*/

/*  we could keep track of user movement by assigning
  a unique 'position' value to each area where the user can 
  navigate to e.g: desert-nav, wrong-turn-nav 
  and we can do that with the lock states as well
  e.g: char-5-on, char-5-off (5 is desert)
  and this should be a closure 
*/ 


let userCurrentPosition = 6;
let userCurrentPositionMainScene = 4;
let inventoryItems = false;
let shopItems = true;
let lockedOrNot = '';
let areaExitable = false;
let inventoryMinimised = false;
let busFull = false;
let insideBuilding = false;
let insideBuildingForText = false;
let inventoryAlreadyOnScreen = false;
let currentInventoryPosition;
let inventorySlots = [];
let movedToInventoryItemCharNames = [];
let mainSceneItemsInInventory = [];
// set scene temporarily
export let currentScene = scenes[0];
alterScenes();
function alterScenes(scene = 0){
  let curScene = scene > 0 ? scene : 0;
  if(lockedOrNot === 'unlocked') {
    currentScene = scenes[curScene];
  }
}

// this changes as player makes advancement in game
let mapAreaStates = [{
  mapArea : 6,
  state : 'unlocked'
},{
  mapArea : 5,
  state : 'locked'
},{
  mapArea : 7,
  state : 'locked'
},];

game();
function game() {
   handleClueTextField();
   prepareGameField();
}

export function getCharByNum(num) {
  console.log(num);
  let charOfInterest;
  chars.forEach((char)=>{
    if(char.charId === num) {
      charOfInterest = char;
    }
  });
  return charOfInterest;
  }

function handleClueTextField() {
  let changeBtn = currentScene.sceneNum === 1
  ?
  'Start Game!'
  :
  'Give Clue!'
  ;
  if(currentScene.sceneNum === 2){
    if(userCurrentPositionMainScene === 4){
      let areaExitable = busFull ? true : false;
      let exitable = areaExitable ? 'exit-ok' : 'exit-not-ok';
      changeBtn = `<span class= exit-${exitable}>Exit!`
    } else if(userCurrentPositionMainScene === 13){
      changeBtn = 'Enter Area!'
    } else if(userCurrentPositionMainScene === 14){
      if(insideBuildingForText){
        changeBtn = 'Exit Building!'
      } else {
        changeBtn = 'Enter Building!'
      }
      
    }
    
  }

  let makeClueBtn = `
  <button 
  class="clue-btn js-clue-btn"
  >
    ${changeBtn}
  </button>`;

let makeClueBox = 
  `<p 
  class="clue-textbox js-clue-textbox"
  >
    Welcome to kinderbegeleidster! This text area is 
    for clues, feel free to ask for clue if you're stuck!
  </p>`;

const clueContainerElement = 
document.querySelector('.js-clue-window');

clueContainerElement.innerHTML =
makeClueBtn;

clueContainerElement.innerHTML +=
makeClueBox;

const clueDscriptionElement = 
document.querySelector('.js-clue-textbox');

let clueBtn = document.querySelector('.js-clue-btn');
clueBtn.addEventListener('click',()=>{
  if(currentScene.sceneNum === 1){
    alterScenes(1);
    game();
  } else if(currentScene.sceneNum === 2){

    // this we need so we dont enter building even if we
    // are not on area 14 (building x mark pos)
    if(userCurrentPositionMainScene === 14) {
    
      // if we inside shop than this btn is true


      if(!insideBuilding){
        // if we inside here we can choose to leave if press btn
        // currently when we inside here we can leave building
        //by pressing minimize inventory or unfold it
      let school_vacation_mainAreaNod = 
      document.querySelector(
        '.js-school_vacation_main-character'
      );

      let inventroyBuildingInsideNod = 
      document.querySelector(
        '.js-inventory_building_inside-character'
      );
      // items musnt be included into chars_participating
      // otherwise they disappear too
      let concatenatedSelectors = fetchRelevantNodsBuildingInside();
      let allHidableNods = school_vacation_mainAreaNod.
      querySelectorAll(concatenatedSelectors);
      allHidableNods.forEach((nod)=>{
        nod.classList.add('building-inside');

        inventroyBuildingInsideNod.classList.add(
          'building-inside-true'
        );
      });
      // we are not allowing this to become true 
      // just because we unfold and collapse inventory
      // we dont generate all this if is false
      // !!! solution: we dont turn this to true!!!
      // coz if we do the next time the code regenerates
      // its got gonna regenerate this part of code
      insideBuildingForText = true;
      handleClueTextField();

      insideBuilding = true;
      
      
      } else {
        insideBuilding = false;
        insideBuildingForText = false;
        game();
      }
    }
  }
});

clueDscriptionElement.innerHTML = currentDescription();

  function currentDescription() {
    if(currentScene.sceneNum === 1){
      let HTML = '';
      let getCurrentPace = CurrentPace();
      mapAreaStates.forEach((AreaState)=>{
        if(AreaState.mapArea === userCurrentPosition){
          lockedOrNot = AreaState.state 
          === 'locked'
          ?
          'locked'
          :
          'unlocked'
          ;
          HTML += `You are currently on: 
          <span class='currentPlace'>${getCurrentPace}!
          </span><br>This area is <span 
          class='currentState${lockedOrNot}'>
           ${AreaState.state}!
           </span>`;
        }
      });
  
      function CurrentPace(){
          let char = getCharByNum(userCurrentPosition);
          return char.name;
      }
      return HTML;
    } else if(currentScene.sceneNum === 2){
      if(userCurrentPositionMainScene === 4){
        if(busFull){
          return 'Press button to Exit area!';
        } else {
          return 'You can`t exit with an empty bus!';
        }
        
      } else if(userCurrentPositionMainScene === 13){
        return 'Enter area: Woods';
      } else if(userCurrentPositionMainScene === 14){
        return 'An inventory building!';
      }
    }
  }

}

/**
 * first we generate all chars with their div and img
 */
function prepareGameField() {
 
    let currentSceneCharacters = [];
    let currentSceneContainerCharacter;
    let gameField = document.querySelector('.js-game-field');
  
  
    let HTML = '';
    let imgElements = makeImgElements();
    // object with all chars and their corresponding numbers
    let makeCharContainers = makeCharElements(imgElements);
  
  
    function makeImgElements() {
      let imgElements = [];
  
      let imgClassName;
      let imgPath;
      let makeResourcePath; 
      let imgElement;
  
      function makeResPath(imgPath) {
        let resPath = `
        data/resources/${imgPath}
        `;
        return resPath;
      }
  
      function makeImgElement(imgClassName,makeResourcePath) {
        let imgElement = `
          <img class= 
          '
          ${imgClassName}-character-img
          js-${imgClassName}-character-img
          '
          src = 
          '
          ${makeResourcePath}
          '
          >
        `;
        return imgElement;
      }
      
      chars.forEach((char)=>{
       
          imgClassName = char.name;
          imgPath = char.img;
          makeResourcePath = makeResPath(imgPath);
          imgElement = makeImgElement(imgClassName,makeResourcePath);
          imgElements.push(imgElement);
       
      });
        return imgElements;
    }
  
    function makeCharElements(imgElements) {
      let charObjects = [];
      let charElements = '';
      let helper;
      let charSpecimen;
      let styleAbs = 'position: absolute';
      let currentContainerName = currentScene.sceneNum
      === 2 ? 'school_vacation_main' : 'full_map';

      
      imgElements.forEach((imgElement,index)=>{
        let stylePos;
        helper = getCharByNum(index+1);
        // charPosition is set up in a way that it can
        // only be used in scene 1
        stylePos = currentScene.sceneNum === 1 ?
        fetchCharPos(helper)
        :
        '';
        
        charSpecimen = `
        <div
        style='${helper.name === currentContainerName ? '' : styleAbs};
        ${stylePos} '
        
  
        class = 
        '
        ${helper.name}-character
        js-${helper.name}-character
        '
        >
          ${imgElement}
        </div>
        `;
  
        charElements += charSpecimen;
        charObjects.push({
          charNum : index+1,
          charElement : charSpecimen
        });
      });
      
      return charObjects;
    }
  
    function fetchCharPos(char) {
      let toReturn = '';
      charPosition.forEach((charPos)=>{

          if(charPos.charNum === char.charId){
            toReturn = charPos.charPosition;
          } 
        });
      return toReturn;

    }
    
  
    makeCharContainers.forEach((charContainer)=>{

      if(currentScene.chars_participating.includes(charContainer.charNum)) {
        currentSceneCharacters.push(charContainer);
      }
      
    });
  
    let multipleChar = turnCharElementToChar(currentSceneCharacters[0]);
    
    function turnCharElementToChar(charObj) {
      let char = getCharByNum(charObj.charNum);
      return char;
    }
  
    let test = manufactureElement(multipleChar,2);
    //gameField.innerHTML = test;
  
  
    /**
     * first we need to put everything into their necessary
     * container 
     */
    //full_map character always relative(in css)
    
  
    function findCurrentSceneCharElementByNum (num) {
      let char;
      // currentSceneCharacters is an Obj with HTML div and num
      currentSceneCharacters.forEach((SceneCharacter)=>{
        if(SceneCharacter.charNum === num) {
          char = SceneCharacter;
        }
      });
      return char;
    }
  
    function findCurrentSceneAreaCharElement () {
      let toReturn = [];
      let i;
      let chars = currentScene.areaContainerCharacter;
      // currentSceneCharacters is an Obj with HTML div and num
        for(i=0; i < chars.length; i++){
          currentSceneCharacters.forEach((SceneCharacter)=>{
            if(chars[i] === SceneCharacter.charNum ) {
              toReturn.push(SceneCharacter.charElement);
            }
        });
        }
      return toReturn;
    }
  
    function findCurrentSceneFieldCharElement () {
      let toReturn = [];
      let i;
      let chars = currentScene.fieldContainerCharacter;
      // currentSceneCharacters is an Obj with HTML div and num
        for(i=0; i < chars.length; i++){
          currentSceneCharacters.forEach((SceneCharacter)=>{
            if(chars[i] === SceneCharacter.charNum ) {
              toReturn.push(SceneCharacter.charElement);
            }
        });
        }
      
      return toReturn;
    }
  
    function generateDOM(charNum) { 
      let char;
      let charPassiveNosElements = [];
      let helper;
      if(typeof charNum === 'number') {
        char = getCharByNum(charNum);
        // this is full map and its already on the dom
      return document.querySelector(`.js-${char.name}-character`);
      } else {
        charNum.forEach((arrayElement)=>{
          char = getCharByNum(arrayElement);
          // these are not yet on the dom so null unless in ''
          helper = `document.querySelector('.js-${char.name}-character')`;
          charPassiveNosElements.push(helper);
        });
        return charPassiveNosElements;
      }
    }

    // this is better than previous approach
    function generateDOMFromChar(incomingChar){
      let concatenatedChars = [];
      if(Array.isArray(incomingChar)){
        incomingChar.forEach((char)=>{
          concatenatedChars.push(`.js-${char.name}-character`);
        });
      } else {

      }
      let DOMChars = concatenatedChars.join(',');
      return DOMChars;
    }
  
    function turnStringToCode(string){
      return eval(string);
    }
  
    renderGame();
    function renderGame() {
      //this is a character of the characters.js 
      currentSceneContainerCharacter = getCharByNum(currentScene.sceneContainerCharacter);
      //this is a character from the HTML div kind
      let sceneCharObj = findCurrentSceneCharElementByNum(currentSceneContainerCharacter.charId);
      // this is a complete char div
      let currentSceneContCharElement = sceneCharObj.charElement;
      // this is on the field
      gameField.innerHTML = currentSceneContCharElement;
      
      // we make a dom from full map
      let DOMcurrentSceneContCharElement = generateDOM(currentSceneContainerCharacter.charId);
      // this is on the gamefield we just needed a nod of it
      // we need to place areas on the map here
      // all this has to be generated automatically !!! -->
      let fetchAreaElements = findCurrentSceneAreaCharElement();
      // here we use appendchild cow its is designed to append DOM nodes
      fetchAreaElements.forEach((elm)=>{
        console.log(elm);
        DOMcurrentSceneContCharElement.innerHTML += elm;
      });
      /**
       * When you use += with innerHTML, 
       * you're essentially overwriting the entire HTML 
       * content of the element each time you add something.
       * This can cause any previously attached event 
       * listeners or interactive elements to be detached or
       * become non-functional because the old HTML content
       * is replaced with the new one.
       * DOMcurrentSceneContCharElement.innerHTML 
       * += inventoryNormalChar;
       */
     
  
      let DOMareaContainerCharacters = generateDOM(currentScene.areaContainerCharacter);
      
  
      DOMareaContainerCharacters.forEach((DOMareaContainerCharacter)=>{
        // here is our nod for areas like desert,ect..
        let fetchCurrentSceneFieldCharElement = findCurrentSceneFieldCharElement();
        fetchCurrentSceneFieldCharElement.forEach((FieldCharElem)=>{
        
          let turnStringToCodeVar = turnStringToCode(DOMareaContainerCharacter);
          //!! i must learn appendchild() before going further here!!
          turnStringToCodeVar.innerHTML += FieldCharElem;
        });
      });
      handleScene();
      function handleScene() {
        if(currentScene.sceneNum === 1) {
          let schoolAreaNod = document.querySelector('.js-school_vacation-character');
          let schoolBusNod = schoolAreaNod.querySelector('.js-bus-character');
          
          nodStyles(schoolBusNod,'','','-90px','10px','100');

          if(userCurrentPosition !== 6){
            schoolBusNod.style.display = 'none';
          }
      
          let x_markSchoolNod = schoolAreaNod.querySelector('.js-position_field-character');
          nodStyles(x_markSchoolNod,'','','-120px','0px','99');

          // by default we on school-area
      
          let schoolLocked = schoolAreaNod.querySelector('.js-map_area_locked-character');
          let schoolunLocked = schoolAreaNod.querySelector('.js-map_area_unlocked-character');
          
          schoolLocked.style.display = 'none';
          nodStyles(schoolunLocked,'','0px','0px','','100');
      
          //now we need to adjust the positions of items desert-area
          let desertAreaNod = document.querySelector('.js-desert-character');
          let desertBusNod = desertAreaNod.querySelector('.js-bus-character');
          nodStyles(desertBusNod,'','','30px','-100px','100');
      
          if (userCurrentPosition !== 5) {
            desertBusNod.style.display = 'none';
          }
      
          let desertLocked = desertAreaNod.querySelector('.js-map_area_locked-character');
          let desertunLocked = desertAreaNod.querySelector('.js-map_area_unlocked-character');
          nodStyles(desertLocked,'','0px','0px','','100');
          
          desertunLocked.style.display = 'none';
          
            
          let x_markdesertAreaNodNod = desertAreaNod.querySelector('.js-position_field-character');
          nodStyles(x_markdesertAreaNodNod,'','','0px','-110px','99');
      
          //adjust the positions of chars inside desert-area
          let wrong_turnAreaNod = document.querySelector('.js-wrong_turn-character');
          let wrong_turnBusNod = wrong_turnAreaNod.querySelector('.js-bus-character');
          nodStyles(wrong_turnBusNod,'','','30px','-110px','100');
    
          if (userCurrentPosition !== 7) {
            wrong_turnBusNod.style.display = 'none';
          }
      
          let wrong_turnLocked = wrong_turnAreaNod.querySelector('.js-map_area_locked-character');
          let wrong_turnunLocked = wrong_turnAreaNod.querySelector('.js-map_area_unlocked-character');
      
          
          wrong_turnunLocked.style.display = 'none';
          nodStyles(wrong_turnLocked,'','0px','0px','','100');
          
          let x_markwrong_turnAreaNodNod = wrong_turnAreaNod.querySelector('.js-position_field-character');
          nodStyles(x_markwrong_turnAreaNodNod,'','','0px','-120px','99');

          // lets put event listeners on parents of x-marks
          schoolAreaNod.addEventListener('click',()=>{
            userCurrentPosition = 6;
            game();
          });
      
          desertAreaNod.addEventListener('click',()=>{
            userCurrentPosition = 5;
            game();
          });
      
          wrong_turnAreaNod.addEventListener('click',()=>{
            userCurrentPosition = 7;
            game();
          });
      
        } else if(currentScene.sceneNum === 2){
          
          let school_vacation_mainAreaNod = document.querySelector('.js-school_vacation_main-character');
          
          // bus 'parking place'
          let busNod = school_vacation_mainAreaNod.querySelector('.js-bus-character');
          let xMarkBusNod = busNod.querySelector('.js-position_field-character');
          nodStyles(busNod,'0px','50%','','50%','100');
          nodStyles(xMarkBusNod,'','','-100px','-10px','99');
          let begeleidsterBusNod = busNod.querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterBusNod,'','','-80px','10px','100');
         
          // woods 
          let woodsNod = school_vacation_mainAreaNod.
          querySelector('.js-board_woods-character');
          nodStyles(woodsNod,'200px','0px','','','99');
          let begeleidsterWoodsNod = woodsNod.
          querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterWoodsNod,'','','-80px','20px','100');

          // inventory building 'outside'
          let inventory_building = school_vacation_mainAreaNod.querySelector('.js-inventory_building-character');
          nodStyles(inventory_building,'','','120px','250px','100');
          let xMarkBuildingNod = inventory_building.querySelector('.js-position_field-character');
          nodStyles(xMarkBuildingNod,'','','-100px','30px','99');
          let begeleidsterBuildingNod = inventory_building.querySelector('.js-kinderbegeleidster-character');
          nodStyles(begeleidsterBuildingNod,'','','-80px','50px','100');
          
          // inventory building 'inside'
          let inventroyBuildingInsideNod = document.querySelector(
            '.js-inventory_building_inside-character'
          );

          // we add inventory we happen to know which char
          // is the inventory 19
          let inventoryCharNum = getCharByNum(19);
          // this returns a string
          let inventoryNormalChar = manufactureElement(
            inventoryCharNum
          );
          
          
          // use appendChild not to remove existing even listeners
          // for appendchild to work inventoryNormalChar has to be
          // a DOM element so here we use += instead of appendchild
          // !!! solution insertAdjacentHTML('beforeend', HTMLvar);!!!
          /**
           * "beforebegin"
           * Before the element. Only valid if the element is
           *  in the DOM tree and has a parent element.
           * <!-- beforebegin -->
              <p>
                <!-- afterbegin -->
                foo
                <!-- beforeend -->
              </p>
              <!-- afterend -->
           */
          // we need this so when we change field 
          // inventory doesnt unfold from minimized state
  
            // make sure its positioned absolute
            addToScreen(DOMcurrentSceneContCharElement,
              inventoryNormalChar);
 
            let inventroyNormalNod = school_vacation_mainAreaNod.
            querySelector('.js-inventory_whole-character');
            nodStyles(inventroyNormalNod,'0px','0px','','','100');
            
            // do the same with minimised inventory
            let inventoryCollCharNum = getCharByNum(20);
           
            let inventoryCollapsedChar = manufactureElement(
              inventoryCollCharNum
            );
            addToScreen(inventroyNormalNod,inventoryCollapsedChar);
           
            let currentItemChars = getCurrentItems();

            function getCurrentItems() {
              let relevantItemsList = currentScene.school_area_items;
              let itemsArray = [];
              let itemChars = [];
              items.forEach(item => {
                if(relevantItemsList.includes(item.itemId)){
                  itemsArray.push(item);
                }
              });
              itemsArray.forEach((item)=>{
                chars.forEach((char)=>{
                  if(item.charId === char.charId){
                    itemChars.push(char);
                  }
                });
              });
              return itemChars;
            }
            let manufacturedItemElements = [];
  
            currentItemChars.forEach((itemChar)=>{
              manufacturedItemElements.push(
                manufactureElement(
                  itemChar
                )
              );
            });

            // generate nods of items
            let itemRawNods = generateDOMFromChar(currentItemChars);

            if(shopItems) {
              addToScreen(inventroyBuildingInsideNod,
                manufacturedItemElements);
            } else {
              addToScreen(inventroyNormalNod,
                mainSceneItemsInInventory);

            }
            
            // when we click on an item it gets added to inventory
            let itemNods = inventroyBuildingInsideNod.
            querySelectorAll(itemRawNods);
            console.log(itemNods);
            
            itemNods.forEach((actualItemNod)=>{
              actualItemNod.addEventListener('click',()=>{
                // item has to start with small letter
                let charName = actualItemNod.dataset.itemName;
                movedToInventoryItemCharNames.push(charName);
                let itemId = actualItemNod.dataset.itemId;
                //1. we remove item from building table
                const originalParent = inventroyBuildingInsideNod;
                const newParent = inventroyNormalNod; 
                let divToMove = inventroyBuildingInsideNod.
                querySelector(`.js-${charName}-character`);
                //2. we add it to inventory
                newParent.appendChild(divToMove);
               // let currentNodeParent = divToMove.parentNode;
               mainSceneItemsInInventory.push(divToMove);
                //console.log("Current parent of the node:", currentNodeParent);
                // associate item num with inventory num
                inventorySlots.push({
                  slotNum : itemId,
                  charName
                });
                divToMove.classList.add(`${charName}-inside-inventory`);
                // we set new position to item

                //originalParent.removeChild(divToMove);
                //getInventorySlot(divMoved,itemId);
              });
            });
           


            function getInventorySlot(nod,itemId){
              inventory.forEach((slot)=>{
                if(slot.slotNum === itemId){
                  nod.style.position = slot.position;
                  let top = slot.top;
                  let right = slot.top;
                  let bottom = slot.top;
                  let left = slot.top;
                  nodStyles(nod,top,right,bottom,left,'101');
                }
              });
            }
  
            function addToScreen(whereNod,whatElement){
              
              if(Array.isArray(whatElement)){
                whatElement.forEach(element => {
                  if(typeof element === 'string'){
                    whereNod.insertAdjacentHTML(
                      'beforeend', element
                    );
                  } else {
                    whereNod.insertAdjacentHTML(
                      'beforeend', element.outerHTML
                    );
                  }

                });
              } else {
                whereNod.insertAdjacentHTML(
                  'beforeend', whatElement
                );
              }
            }

            // we make inventory collapse on topright click
            let inventoryCollNod = inventroyNormalNod.
            querySelector('.js-inventory_whole_minimised-character');
            nodStyles(inventoryCollNod,'0px','0px','','','100');
            // if this is defined, than it means the inventory has
            // a state from previous times, so we override the default
            // state
            if(currentInventoryPosition){
              inventroyNormalNod.style.position =
              currentInventoryPosition;
            }
         
            
            // when we regenerate this part its absolute by default
            // so we need to make position to reflect current state
            // regardless of default position state
            // when inventoryMinimised is true than pos is static
            // but when we regenerate code it turns back to absolute

            // easy solution just put this into a function
            function regenerateInventoryState(){
              currentInventoryPosition = 
              inventoryMinimised ? 
              'static'
              :
              'absolute';

              inventroyNormalNod.style.position =
              currentInventoryPosition;
             }
             let children;
             children = inventroyNormalNod.children;
             // i have to separate item children only
             console.log(children);
            // here we need to pay attention if we inside building
            // or we leave building automatically at every refresh
            inventoryCollNod.addEventListener('click',()=>{
              
              let itemInventoryNods = inventroyNormalNod.
              querySelectorAll(itemRawNods);
              itemInventoryNods.forEach((itemNod)=>{
                itemNod.classList.add('outfolded');
              });
                if(itemInventoryNods.length > 2) {
                  inventoryItems = true;
                  shopItems = false;
                }
              
              if(!inventoryMinimised){
                inventoryMinimised = true;
                // when inventory collapses we apply class
                // on items so they disappear
                itemInventoryNods.forEach((itemNod)=>{
                  itemNod.classList.add('collapsed');
                });
                regenerateInventoryState();
              } else {
                inventoryMinimised = false;
                itemInventoryNods.forEach((itemNod)=>{
                  itemNod.classList.remove('collapsed');
                });
                regenerateInventoryState();
              }
            });
    
          if(userCurrentPositionMainScene !== 4){
            begeleidsterBusNod.style.display = 'none';
          } if(userCurrentPositionMainScene !== 13) {
            begeleidsterWoodsNod.style.display = 'none';
          } if(userCurrentPositionMainScene !== 14) {
            begeleidsterBuildingNod.style.display = 'none';
          } 
          busNod.addEventListener('click',()=>{
            userCurrentPositionMainScene = 4;
            game();
          });

          inventory_building.addEventListener('click',()=>{
            userCurrentPositionMainScene = 14;
            game();
          });

          woodsNod.addEventListener('click',()=>{
            userCurrentPositionMainScene = 13;
            game();
          });

      }
      //now we need to adjust the positions of items school-area
      function nodStyles(nod,top,right,bottom,left,zIndex) {
        let nodVar = nod;
        let topVar = top;
        let rightVar = right;
        let bottomVar = bottom;
        let leftVar = left;
        let zIndexVar = zIndex;
        nod.style.top = topVar;
        nod.style.right = rightVar;
        nod.style.bottom = bottomVar;
        nod.style.left = leftVar;
        nod.style.zIndex = zIndexVar;
      }

    }
}

}
