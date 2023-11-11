
//needs to be chrome
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

// Display alert if not using Chrome
if (!isChrome) {
    alert("For compatibility, we require Google Chrome. Please switch to Chrome for the intended experience.");
}

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d", {willReadFrequently : true});
ctx.willReadFrequently = true;

const uiContainer = document.getElementById("ui-container");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerWidth = 90;
const playerHeight = 125;
const playerSpeed = 20;
const player_sprite_count = 12;
const proximityDistance = 100;
const collisionProximity = 20;

const gender = 'boy';
// const playerUI = document.getElementById("player");
const characterImage = new Image();
// characterImage.src =playerUI.src;

characterImage.src =`public/player/player_${gender}_sprite_transparent.png`;
const orientation_map ={
    'up': 1,
    'down': 0,
    'left': 3,
    'right' : 2
}
const no_of_frames = 3;
let currentOrientation = "up";
let previousOrientation = "up";
let movementCount = 0;


const backgroundImage = new Image();
backgroundImage.src = "public/maps/alpha/Hoenn_Secret_Base_Alpha.png"; // Replace with the path to your background image

const collisionMapImage = new Image();
collisionMapImage.src = "public/maps/alpha/collision_map_alpha.jpg"; // Replace with the path to your collision map image





// Define the screen's width and height (your sliding window dimensions)
const screenWidth = canvas.width;
const screenHeight = canvas.height;





let playerX = canvas.width / 2 - playerWidth / 2;

let playerY = canvas.height / 2 - playerHeight / 2;
const stopThreshold = 0;
const scale = 10;


//UI
function getUIPosition(uiElement) {
    const rect = uiElement.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top,
    };
}
const exits =[];
const uiElementPositions = {};


// Iterate through the UI elements in the uiContainer
Array.from(uiContainer.children).forEach((uiElement) => {
    const uiPosition = getUIPosition(uiElement);
    if(uiElement.value && uiElement.value === 'exit'){
        exits.push(uiElement.id);
    }
    // Store the UI element's position in the object with the element's id as the key
    uiElementPositions[uiElement.id] = uiPosition;
});


//TEXT UI
let texts = [];
let text_counter = 0;
let isInteractingWithText = false;
let isRequestInProgress = false;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//USE TO SET PLAYER Initial Position wrt to map. Used to define drawX and drawY, where to draw the (0,0) 
//background image. so desired_ref_point = drawX, drawY
//since init_screen_player_pos = canvas.width/2 - playerWidth / 2, canvas.height/2 - playerHeigth / 2
//if exit is at img_coord = (x,y) in map, and we want exit to be at init_screen_player_pos
//then x = canvas.width/2 - playerWidth / 2 - img_coord.x, y = canvas.height/2 - playerHeigth / 2 - img_coord.y
const defaultSpawnPoint = uiElementPositions[exits[0]];
let spawnID = 'exit';

const defaultSpawnPointWidth = () =>{
    const uiElement = document.getElementById(exits[0]);
    return uiElement.offsetWidth;
}


const defaultSpawnPointHeight = () =>{
    const uiElement = document.getElementById(exits[0]);
    return uiElement.offsetHeight;
}



let initXUIRefPoint = defaultSpawnPoint.x;
let initYUIRefPoint =  defaultSpawnPoint.y;


// Function to set the cookie
function setCookie() {
    document.cookie = "user_location=" + encodeURIComponent(JSON.stringify(locationData)) + "; expires=" + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString() + "; path=/";
    console.log('cookie set');
}

function getLocationFromCookie() {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === "user_location") {
            return JSON.parse(decodeURIComponent(value));
        }
    }
    return null; // Cookie not found
}
let locationData = getLocationFromCookie();
console.log(locationData);
let xUIRefPoint = initXUIRefPoint;
let yUIRefPoint = initYUIRefPoint;
if (locationData) {
    xUIRefPoint = locationData.x;
    yUIRefPoint = locationData.y;
    console.log('cookie found');
}

//reupdate locations of ui wrt center of screen
for(const id in uiElementPositions){
    const pos = uiElementPositions[id];
    
    const percentageShiftX = ((pos.x-xUIRefPoint) / (backgroundImage.width * scale));
    const percentageShiftY = ((pos.y- yUIRefPoint) / (backgroundImage.height * scale));
    let offsetX = backgroundImage.width * scale * percentageShiftX;
    let offsetY = backgroundImage.height * scale * percentageShiftY;
    if(id === 'peri_bb1' || id === 'peri_bb2'){
        const x_shift = xUIRefPoint - initXUIRefPoint;
        offsetY += x_shift*0.2;
        // const element = document.getElementById(id);
        // offsetY -= element.offsetHeight*(1-0.2);
        // offsetY +=100;
        // offsetY += playerHeight;
    }
    uiElementPositions[id] = {
        x : offsetX + canvas.width/2 - playerWidth/2,
        y :  offsetY + canvas.height/2 + playerHeight/2 //l
    }    

}




//main functions
const onLoadMain = () =>{ 
    backgroundImage.onload = () => {
        collisionMapImage.onload = () => {
            
            function drawBackground() {
                const zoomScale = scale;
                // Calculate the position and size of the zoomed background image
                const zoomedWidth = backgroundImage.width * zoomScale;
                const zoomedHeight = backgroundImage.height * zoomScale;

                // Calculate the position of the zoomed background image center
                //the addition and minus of player Width on exit kinda depends on the oreintation
                //but this is very expected behvaiour so we can hard code this
                const zoomedCenterX = xUIRefPoint + playerWidth /2;
                const zoomedCenterY = yUIRefPoint - playerHeight/2;
                
            
                // Calculate the draw position on the canvas to center the zoomed background image
                const drawX = canvas.width / 2 - zoomedCenterX;
                const drawY = canvas.height / 2 - zoomedCenterY;
                // Draw the zoomed background image
                    //backgroundImage: This is the image you want to draw. It should be an HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement.
                    // 0, 0: These two values specify the source position within the backgroundImage where the image data should be taken from. In this case, it starts from the top-left corner (coordinates 0,0) of the backgroundImage.
                    // backgroundImage.width, backgroundImage.height: These values specify the width and height of the source image region to be drawn. In your code, it means the entire backgroundImage will be used as the source.
                    // drawX, drawY: These are the destination coordinates on the canvas where the top-left corner of the source image will be drawn. drawX is the x-coordinate, and drawY is the y-coordinate.
                    // zoomedWidth, zoomedHeight: These values determine the width and height of the drawn image on the canvas. If these values are different from the source image's width and height, it can lead to scaling or resizing of the image when drawn on the canvas.
                ctx.drawImage(
                    backgroundImage, 
                    0, 0, 
                    backgroundImage.width, backgroundImage.height,
                    drawX, drawY, 
                    zoomedWidth, zoomedHeight);
                    
                // const prevStyle = ctx.fillStyle;
                // ctx.fillStyle = "black";
                // if(drawX <= canvas.height){
                //     ctx.fillRect(0, 0, drawX, canvas.height);

                // }
                // else{
                // ctx.fillRect(0, 0, canvas.height, drawX);

                // }
                // if(drawY <= canvas.width){
                //     ctx.fillRect(0, 0, drawY, canvas.width);

                // }
                // else{
                // ctx.fillRect(0, 0, canvas.width, drawY);

                // }
                // ctx.fillRect(0, 0, drawX, canvas.height);
                // ctx.fillRect(0, 0, canvas.width,drawY);
                // ctx.fillStyle = prevStyle;
                // const gridSize = 10;
                // for (let y = 0; y < canvas.height; y += gridSize) {
                //     ctx.moveTo(0, y);
                //     ctx.lineTo(canvas.width, y);
                //   }
                  
                //   // Draw vertical grid lines
                //   for (let x = 0; x < canvas.width; x += gridSize) {
                //     ctx.moveTo(x, 0);
                //     ctx.lineTo(x, canvas.height);
                //   }
                  
            }

            function drawCollisionMap(){
                const zoomScale = scale;

                // Calculate the position and size of the zoomed background image
                const zoomedWidth = collisionMapImage.width * zoomScale;
                const zoomedHeight = collisionMapImage.height * zoomScale;
            
                // Calculate the position of the zoomed background image center
                //the addition and minus of player Width on exit kinda depends on the oreintation
                //but this is very expected behvaiour so we can hard code this
                const zoomedCenterX = xUIRefPoint + playerWidth /2;
                const zoomedCenterY = yUIRefPoint - playerHeight/2;
                
            
                // Calculate the draw position on the canvas to center the zoomed background image
                const drawX = canvas.width / 2 - zoomedCenterX;
                const drawY = canvas.height / 2 - zoomedCenterY;
                // const drawX = initXUIRefPoint - zoomedCenterX;
                // const drawY = initYUIRefPoint - zoomedCenterY;
            
                // Draw the zoomed background image
                ctx.drawImage(
                    collisionMapImage, 
                    0, 0, 
                    collisionMapImage.width, collisionMapImage.height, 
                    drawX, drawY, 
                    zoomedWidth, zoomedHeight,
                    willReadFrequently=true,
                    );

            }

            function updateUIpositions(reverse = false) {
                for(let i = 0; i < uiContainer.children.length; i++){
                    if(!(uiContainer.children[i].id in uiElementPositions)){
                        const uiElement = uiContainer.children[i];
                        const uiPosition = getUIPosition(uiElement);
                        uiElementPositions[uiElement.id] = uiPosition;
                    }
                    else if(reverse){
                        const uiElement = uiContainer.children[i];
                        const _uiPosition = uiElementPositions[uiElement.id];
                        switch(currentOrientation){
                            case 'up':
                                _uiPosition.y -= playerSpeed*1.5;
                                break;
                            case 'down':
                                _uiPosition.y += playerSpeed*1.5;
                                break;
                            case 'left':
                                _uiPosition.x -= playerSpeed*1.5;
                                if(uiElement.id === 'peri_bb1' || uiElement.id === 'peri_bb2'){
                                    _uiPosition.y += playerSpeed*1.5*0.2;
                                }
                                break;
                            case 'right':
                                _uiPosition.x += playerSpeed*1.5;
                                if(uiElement.id === 'peri_bb1' || uiElement.id === 'peri_bb2'){
                                    _uiPosition.y -= playerSpeed*1.5*0.2;
                                }
                                break;
                        }
                        uiElementPositions[uiElement.id] = _uiPosition;
                    }
                    else{
                        const uiElement = uiContainer.children[i];
                        const _uiPosition = uiElementPositions[uiElement.id];
                        switch(currentOrientation){
                            case 'up':
                                _uiPosition.y += playerSpeed;
                                break;
                            case 'down':
                                _uiPosition.y -= playerSpeed;
                                break;
                            case 'left':
                                _uiPosition.x += playerSpeed;
                                if(uiElement.id === 'peri_bb1' || uiElement.id === 'peri_bb2'){
                                    _uiPosition.y -= playerSpeed*0.2;
                                }
                                break;
                            case 'right':
                                _uiPosition.x -= playerSpeed;
                                if(uiElement.id === 'peri_bb1' || uiElement.id === 'peri_bb2'){
                                    _uiPosition.y += playerSpeed*0.2;
                                }
                                break;
                        }
                        uiElementPositions[uiElement.id] = _uiPosition;
                    }
                }
            }   

            function drawUIElement(uiElement, x, y) {
                const img = new Image();
                img.src = uiElement.src;
                //current position of ui
                const width = uiElement.offsetWidth;
                const height = uiElement.offsetHeight;
                ctx.setTransform(1, 0, 0, 1, 0, 0); 
                if(uiElement.id == 'peri_bb1' || uiElement.id == 'peri_bb2'){
                    ctx.transform(1, 0.2, 0, 1, 0, -uiElement.offsetHeight*(1-0.2));
                }   
                uiElement.style.top = `${y}px`;
                uiElement.style.left = `${x}px`;
                img.onload = () => {
                    ctx.drawImage(img, x, y, width, height);
                    
                }
                ctx.drawImage(img, x, y, width, height);
                
            }

            function drawUI() {
                // console.log('draw');
                const uiElements = uiContainer.children; //for now
                if (uiElements.length === 0) {
                    return; // No UI elements to draw
                }
                for(let i = 0; i < uiElements.length; i++){
                    const uiElement = uiElements[i];
                    const uiPosition = uiElementPositions[uiElement.id];
                    drawUIElement(uiElement, uiPosition.x, uiPosition.y);
                }
            }

            function drawChatBox(text) {
                const chatbox_img = new Image();
                const wpadding = 100;
                const hpadding = 40;
                const x = wpadding;
                const screenHeight = canvas.height;
                const screenWidth = canvas.width;
                const chatboxHeight = screenHeight/5;
                const chatboxWidth = screenWidth - 2*wpadding;
                const y = screenHeight - hpadding - chatboxHeight;
                chatbox_img.src = 'public/pokemon_resources/chatbox.png';
                ctx.globalCompositeOperation = "source-over";
                chatbox_img.onload = () => {
                    ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                    const text_x = x + wpadding/2;
                    const text_y = y + hpadding/2;
                    const font_size = 48;
                    ctx.font = `${font_size}px MyCustomFontv1`;
                    ctx.fillStyle = 'black';
                    ctx.fillText(text, text_x, text_y);
                };
                ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                const text_x = x + wpadding;
                const text_y = y + hpadding*2;                    
                const font_size = 48;
                ctx.font = `${font_size}px MyCustomFontv1`;
                ctx.fillStyle = 'black';
                const max_letters = chatboxWidth/(font_size/2) - 5;
                let line = '';
                let line_count = 0;
                while(text.length > 0){
                    if(text.length > max_letters){
                        line = text.slice(0, max_letters);
                        // line += '-';
                        text = text.slice(max_letters);
                    }
                    else{
                        line = text;
                        text = '';
                    }
                    ctx.fillText(line, text_x, text_y + line_count*(font_size+hpadding/2) );
                    line_count += 1;
                }

                // ctx.fillText(text, text_x, text_y);
            }
            
            function drawPlayer() {
                // calculate offset for sprite
                const orientation = orientation_map[currentOrientation];
                const spriteWidth = characterImage.width / player_sprite_count;
                const spriteHeight = characterImage.height;
                const spriteX = spriteWidth * (orientation * 3 + movementCount) ;
                const spriteY = 0;
                ctx.drawImage(characterImage, spriteX, spriteY, spriteWidth, spriteHeight, playerX, playerY, playerWidth, playerHeight);
                var x1 = playerX;
                var y1 = playerY;
                var x2 = playerX + playerWidth;
                var y2 = playerY + playerHeight;
                // Define the stroke color
                ctx.strokeStyle = "blue"; // You can use other CSS color values
          
                // Define the line width
                ctx.lineWidth = 2;
          
                // Draw the rectangular border
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                // ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                // ctx.drawImage(characterImage, spriteX, spriteY, spriteWidth, spriteHeight, xUIRefPoint, yUIRefPoint, playerWidth, playerHeight);
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            // let lastFrameTime = 0;
            function updateGameArea(timestamp) {
                // if (timestamp - lastFrameTime >= frameDelay) {
                clearCanvas();
                    
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                // drawCollisionMap();
                
                drawBackground(); // Draw the background image first
                ctx.globalCompositeOperation = "source-atop"; // Set composite operation to "destination-over" for the collision map
                
                // drawPlayer(); // Draw the player on top of the collision map
                drawUI();                
                // Draw the player
                drawPlayer();
                if(isInteractingWithText && text_counter < texts.length){
                    drawChatBox(texts[text_counter]);
                }

                requestAnimationFrame(updateGameArea);
            }

            function checkCollision(player, item, threshold = 5) {
                const playerLeft = player.left;
                const playerRight = player.right;
                const playerTop = player.top;
                const playerBottom = player.bottom;
              
                const itemLeft = item.left;
                const itemRight = item.right;
                const itemTop = item.top;
                const itemBottom = item.bottom;
              
                switch (currentOrientation) {
                    case 'up':
                        // Check if the player's top border collides with the UI's bottom border and they are aligned horizontally
                        if (playerTop - threshold <= itemBottom && playerTop >= itemBottom && 
                            ( (playerLeft >= itemLeft && playerRight <= itemRight) || (playerRight >= itemLeft && playerRight <= itemRight) || (playerLeft >= itemLeft && playerLeft <= itemRight) ) ) {
                            return true; // Collision detected
                        }
                        break;
                    case 'down':
                        // Check if the player's bottom border collides with the UI's top border and they are aligned horizontally
                        if (playerBottom + threshold >= itemTop && playerBottom <= itemTop &&
                            ( (playerLeft >= itemLeft && playerRight <= itemRight) || (playerRight >= itemLeft && playerRight <= itemRight) || (playerLeft >= itemLeft && playerLeft <= itemRight) ) ) {
                            return true; // Collision detected
                        }
                        break;
                    case 'left':
                        // Check if the player's left border collides with the UI's right border and they are aligned vertically
                        if (playerLeft - threshold <= itemRight && playerLeft >= itemRight && 
                            ((playerTop >= itemTop && playerBottom <= itemBottom) || (playerTop >= itemTop && playerTop <= itemBottom) || playerBottom >= itemTop && playerBottom <= itemBottom) ) {
                            return true; // Collision detected
                        }
                        break;
                    case 'right':
                        // Check if the player's right border collides with the UI's left border and they are aligned vertically
                        if (playerRight + threshold >= itemLeft && playerRight <= itemLeft &&                             
                            ((playerTop >= itemTop && playerBottom <= itemBottom) || (playerTop >= itemTop && playerTop <= itemBottom) || playerBottom >= itemTop && playerBottom <= itemBottom) ) {
                            return true; // Collision detected
                        }
                        break;
                }
              
                // No collision
                return false;
            }

            function hitUI(x,y, proximityRange = 0 ){
                let i = 0;
                // Check collision with UI elements
                if (!uiElementPositions) {
                    return false; // No UI elements to check for collision with
                }
                for (const id in uiElementPositions) {
                    const uiElement = document.getElementById(id);
                    if(uiElement.dataset.walkable == "true") continue;
                    const uiPosition = uiElementPositions[uiElement.id];
                    const uiLeft = uiPosition.x;
                    const uiRight = uiPosition.x + uiElement.offsetWidth;
                    const uiTop = uiPosition.y;
                    const uiBottom = uiPosition.y + uiElement.offsetHeight;
                    const ui ={
                        'left' : uiLeft,
                        'right' : uiRight,
                        'top' : uiTop,
                        'bottom' : uiBottom, 
                    }

                    const playerL = x;
                    const playerR = x + playerWidth;
                    const playerT = y;
                    const playerB = y + playerHeight;
                    const p = {
                        'left' : playerL,
                        'right' : playerR,
                        'top' : playerT,
                        'bottom' : playerB,
                    };
                    if(checkCollision(p,ui)) return true
                    // Define the proximity range for UI collision
                    // const proximity = proximityRange;
            
                    // Check if the player's bounding box overlaps with the UI element considering proximity
                    // switch (currentOrientation) {
                    //     case 'up':
                    //       // Check if the player's top border collides with the UI's bottom border and they are aligned horizontally
                    //       if (playerT - proximity <= uiBottom && playerT >= uiBottom && playerL >= uiLeft && playerR <= uiRight) {
                    //         return true; // Collision detected
                    //       }
                    //       break;
                      
                    //     case 'down':
                    //       // Check if the player's bottom border collides with the UI's top border and they are aligned horizontally
                    //       if (playerB + proximity >= uiTop && playerB <= uiTop && playerL >= uiLeft && playerR <= uiRight) {
                    //         return true; // Collision detected
                    //       }
                    //       break;
                    //     case 'left':
                    //       // Check if the player's left border collides with the UI's right border and they are aligned vertically
                    //       if (playerL - proximity <= uiRight && playerL >= uiRight && playerT >= uiTop && playerB <= uiBottom) {
                    //         return true; // Collision detected
                    //       }
                    //       break;

                    //     case 'right':
                    //       // Check if the player's right border collides with the UI's left border and they are aligned vertically
                    //       if (playerR + proximity >= uiLeft && playerR <= uiLeft && playerT >= uiTop && playerB <= uiBottom) {
                    //         return true; // Collision detected
                    //       }
                    //       break;
                    //     default:
                    //         break;
                    //   } 
                }
                return false; // No 
            }

            function hit_Exit(x,y, proximityRange = collisionProximity ){
                    // Check collision with UI elements
                if (exits.length === 0) {
                    return false; // No UI elements to check for collision with
                }
                for (const id of exits) {
                    const uiElement = document.getElementById(id);
                    // const uiPosition = uiElementPositions[uiElement.id];
                    const uiPosition = getUIPosition(uiElement);
                    const uiLeft = uiPosition.x;
                    const uiRight = uiPosition.x + uiElement.offsetWidth;
                    const uiTop = uiPosition.y;
                    const uiBottom = uiPosition.y + uiElement.offsetHeight;
                    
                    const playerL = x;
                    const playerR = x + playerWidth;
                    const playerT = y;
                    const playerB = y + playerHeight;
                    // Define the proximity range for UI collision
                    const proximity = proximityRange;
                    console.log('ui : ',uiLeft,uiTop, uiRight, uiBottom);
                    console.log('player : ', playerL, playerT, playerR, playerB)
            
                    // Check if the player's bounding box overlaps with the UI element considering proximity
                    switch (currentOrientation) {
                        case 'up':
                          // Check if the player's top border collides with the UI's bottom border and they are aligned horizontally
                          if (playerT - proximity <= uiBottom && playerT >= uiBottom && playerL >= uiLeft && playerR <= uiRight) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        case 'down':
                          // Check if the player's bottom border collides with the UI's top border and they are aligned horizontally
                          if (playerB + proximity >= uiTop && playerB <= uiTop && playerL >= uiLeft && playerR <= uiRight) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        case 'left':
                          // Check if the player's left border collides with the UI's right border and they are aligned vertically
                          if (playerL - proximity <= uiRight && playerL >= uiRight && playerT >= uiTop && playerB <= uiBottom) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        case 'right':
                          // Check if the player's right border collides with the UI's left border and they are aligned vertically
                          if (playerR + proximity >= uiLeft && playerR <= uiLeft && playerT >= uiTop && playerB <= uiBottom) {
                            return true; // Collision detected
                          }
                          return false;
                      
                        default:
                          return false;
                      }
                }
                return false; // No 
            }

            function isCollision(x, y, width, height) {
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                drawCollisionMap();
                ctx.willReadFrequently = true;
                
                // ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                // drawBackground(); // Draw the background image first
                ctx.willReadFrequently = true;
                switch(currentOrientation){
                    case 'up':
                        //check collision of upper border
                        for(let i =0; i < width; i++){
                            const pixelData = ctx.getImageData(x + i, y, 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        return false;

                    case 'down':
                        //check collision of lower border
                        for(let i =0; i < width; i++){
                            const pixelData = ctx.getImageData(x + i, y + height , 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        return false;

                    case 'left':
                        //check collision of upper border
                        for(let i = 0; i < height; i++){
                            const pixelData = ctx.getImageData(x, y + i, 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                return true; // Collision detected at any point within the player's area
                            }
                        }

                        return false;
                    
                    case 'right':
                        //check collision of upper border
                        for(let i = 0; i < height; i++){
                            const pixelData = ctx.getImageData(x + width, y + i, 1, 1).data;
                            // Customize this check based on the color of your walls in the collision map image
                            if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                                return true; // Collision detected at any point within the player's area
                            }
                        }
                        return false;
                    
                    default:
                        return false;
                }
            }

            function calculateScreenPosition() {
                const zoomScale = scale;
                screenX = yUIRefPoint - canvas.width / (2 * zoomScale); // Adjust for zoom
                screenY = xUIRefPoint - canvas.height / (2 * zoomScale); // Adjust for zoom
            
            }

            const gameController = (function () {
            
                function handleTextInteraction(event) {
                    if (event.key === 'x') {
                        if (text_counter < texts.length - 1) {
                            text_counter += 1;
                        } else {
                            resetTextInteraction();
                        }
                    }
                }
            
                function resetTextInteraction() {
                    console.log('reset Text UI');
                    isInteractingWithText = false;
                    text_counter = 0;
                    texts = [];
                }
            
                 function movePlayer(event) {
                    let newX = xUIRefPoint;
                    let newY = yUIRefPoint;
                    let _movement_count = movementCount;
            
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight"){
                        newX = handleMovement(event.key, xUIRefPoint, playerSpeed);
                    }

                    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                        newY = handleMovement(event.key, yUIRefPoint, playerSpeed);
                    } 
                    
                    else if (event.key === 'x') {
                         handleUIInteraction();
                    } 
                    
                    else {
                        return;
                    }
            
                    calculateScreenPosition();
                    previousOrientation = currentOrientation;
            
                    const exit = hit_Exit(playerX, playerY);
                    if (exit) {
                        window.location.href = './page2.html';
                    }
            
                    const collision = isCollision(playerX, playerY, playerWidth, playerHeight) || hitUI(playerX, playerY);
                    const moved = (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight');
            
                    if (!collision && moved) {
                        updateUIpositions();
                        xUIRefPoint = newX;
                        yUIRefPoint = newY;
                        movementCount = _movement_count;
                        movementCount += 1;
                        movementCount %= no_of_frames;
                        updateGameArea();
                    } else if (collision && moved) {
                        // Handle collision logic
                        // ...
                    }
                }
            
                function handleMovement(key, position, speed) {
                    switch (key) {
                        case "ArrowLeft":
                            currentOrientation = "left";
                            if (previousOrientation !== currentOrientation) {
                                _movement_count = 0;
                            }
                            return position - speed;
            
                        case "ArrowRight":
                            currentOrientation = "right";
                            if (previousOrientation !== currentOrientation) {
                                _movement_count = 0;
                            }
                            return position + speed;
            
                        case "ArrowUp":
                            currentOrientation = "up";
                            if (previousOrientation !== currentOrientation) {
                                _movement_count = 0;
                            }
                            return position - speed;
            
                        case "ArrowDown":
                            currentOrientation = "down";
                            if (previousOrientation !== currentOrientation) {
                                _movement_count = 0;
                            }
                            return position + speed;
            
                        default:
                            return position;
                    }
                }
            
                function handleUIInteraction() {

                    // Loop through the children of the UI container and check if the player is facing them and within proximity
                    const playerPosition = {x : playerX, y : playerY};
                    for (let i = 0; i < uiContainer.children.length; i++) {
                        const uiElement = uiContainer.children[i];
                        // const uiPosition = getUIPosition(uiElement);
                        const uiPosition = uiElementPositions[uiElement.id];
                        const xDistance = playerPosition.x - uiPosition.x;
                        const yDistance = playerPosition.y - uiPosition.y;
                        
                        //must be a better way to do this
                        // Calculate the absolute values of xDistance and yDistance
                        const absXDistance = Math.abs(xDistance);
                        const absYDistance = Math.abs(yDistance);
                        
                        // Determine if the UI is to the left/right/up/down of the player
                        let uiDirection = '';
                        if (absXDistance > absYDistance) {
                            if (xDistance < 0) {
                                uiDirection = 'right';
                            } else {
                                uiDirection = 'left';
                            }
                        } else {
                            if (yDistance < 0) {
                                uiDirection = 'down';
                            } else {
                                uiDirection = 'up';
                            }
                        }
                        // console.log('check orientation with UI, ', uiDirection);
                        // console.log('uiElement : ', uiElement.id);
                        // console.log('xDistance : ', xDistance);
                        // console.log('yDistance : ', yDistance);
                        // Check if the player is facing the UI
                        //better way to check collision here
                        if (currentOrientation === uiDirection && 
                            absXDistance**2 + absYDistance**2 <= proximityDistance**2) 
                        {
                            
                            // console.log('interacting with UI');
                            // console.log('uiElement : ', uiElement.id);

                            // Perform the interaction for the UI element
                            // interactTextUI(event, uiElement);
                            const filepath = uiElement.dataset.response;
                            if (filepath !== '') {
                                try {
                                    // const response =  fetch(filepath).then(response => {
                                    fetch(filepath).then(response => {
                                        if (response.status === 200) {
                                            console.log("response received:", response);
                                            response.text().then(data => {
                                                const lines = data.split('\n');
                                                for (let i = 0; i < lines.length; i++) {
                                                    if (lines[i] !== '') {
                                                        texts.push(lines[i]);
                                                    }
                                                }
                                                isInteractingWithText = true;
                                                text_counter = 0;
                                            }).catch(error => {
                                                console.error("An error occurred with reading txt file:", error);
                                            });
                                        }
                                }).catch(error => {
                                    console.error("An error occurred with response:", error);
                                });
                                } catch (error) {
                                    console.error("An error occurred with fetching file:", error);
                                }  
                            }
                    }
                    }
                }
            
                return {
                    handleEvent:  function (event) {
                        //handle flow here
                        console.log(isInteractingWithText);
                        if(isInteractingWithText) handleTextInteraction(event);
                        else  movePlayer(event);
                    }
                };
            })();
            
            window.addEventListener("keydown", gameController.handleEvent);
            
            window.addEventListener("resize", function () {
                // Update locationData with new x, y values
                locationData = {x : 0, y : 0};
                locationData.x = xUIRefPoint;
                locationData.y = yUIRefPoint;
                // Set the cookie
                setCookie();
            });
            
            // Event listener for screen refresh or beforeunload
            window.addEventListener("beforeunload", function () {
                // Set the cookie before the page is unloaded
                locationData = {x:0, y:0};
                locationData.x = xUIRefPoint;
                locationData.y = yUIRefPoint;
                setCookie();
            });

            requestAnimationFrame(updateGameArea);
        };
    };
}

characterImage.onload = onLoadMain;

