//alerts 

//needs to be chrome
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

// Display alert if not using Chrome
if (!isChrome) {
    alert("For compatibility, we require Google Chrome. Please switch to Chrome for the intended experience. If screen is black, do refresh and it will work");
}

// Set full screen mode for best experience -- could be better
// function toggleFullscreenAlert() {
//     const fullscreenConfirmation = confirm("Do you want to enter fullscreen mode? This is for a better experience");
    
//     if (fullscreenConfirmation) {
//         const element = document.documentElement;

//         if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
//             if (element.requestFullscreen) {
//                 element.requestFullscreen();
//             } else if (element.mozRequestFullScreen) { // Firefox
//                 element.mozRequestFullScreen();
//             } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
//                 element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
//             } else if (element.msRequestFullscreen) { // IE/Edge
//                 element.msRequestFullscreen();
//             }
//         } else {
//             if (document.exitFullscreen) {
//                 document.exitFullscreen();
//             } else if (document.mozCancelFullScreen) {
//                 document.mozCancelFullScreen();
//             } else if (document.webkitExitFullscreen) {
//                 document.webkitExitFullscreen();
//             } else if (document.msExitFullscreen) {
//                 document.msExitFullscreen();
//             }
//         }
//     }
// }

// Example: Trigger fullscreen when the alert is confirmed
// toggleFullscreenAlert();

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
const proximityDistance = 150;
const collisionProximity = 20;

const gender = 'boy';
// const playerUI = document.getElementById("player");
const characterImage = new Image();
// characterImage.src =playerUI.src;

characterImage.src =`public/player/player_${gender}_sprite_transparent.png`;
console.log(characterImage.src);
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
backgroundImage.src = "public/maps/gamma/Hoenn_Secret_Base_Gamma.png"; // Replace with the path to your background image

const collisionMapImage = new Image();
collisionMapImage.src = "public/maps/gamma/collision_map_gamma.jpg"; // Replace with the path to your collision map image





// Define the screen's width and height (your sliding window dimensions)
const screenWidth = canvas.width;
const screenHeight = canvas.height;





let playerX = canvas.width / 2 - playerWidth / 2;

let playerY = canvas.height / 2 - playerHeight / 2;
const stopThreshold = 0;
const scale = 10;


const uiElementData ={};
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
const lower_chatbox = document.getElementById('lower_chatbox');
const large_chatbox = document.getElementById('large_chatbox');
const chatbox_regex = /chatbox/;

// Iterate through the UI elements in the uiContainer
Array.from(uiContainer.children).forEach((uiElement) => {
    const uiPosition = getUIPosition(uiElement);
    if(uiElement.value && uiElement.value === 'exit'){
        exits.push(uiElement.id);
    }
    else if(uiElement.id === 'chatbox'){

    }
    // Store the UI element's position in the object with the element's id as the key
    uiElementPositions[uiElement.id] = uiPosition;
});


//TEXT UI
let texts = [];
let text_counter = 0;
let text_length = 0;
let isInteractingWithText = false;
let isInteractingWithPoem = false;
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

console.log("exits :", defaultSpawnPoint);
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

//need better method to update/set location cookie
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
// let locationData = getLocationFromCookie();
let locationData = null;
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
    }
    uiElementPositions[id] = {
        x : offsetX + canvas.width/2 - playerWidth/2, // t
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
                    uiElement.style.top = `${y}px`;
                    uiElement.style.left = `${x}px`;
                    
                }
                
                ctx.drawImage(img, x, y, width, height);
                // var x1 = x;
                // var y1 = y;
                // var x2 = x + width;
                // var y2 = y + height;
                // // Define the stroke color
                // ctx.strokeStyle = "blue"; // You can use other CSS color values
          
                // // Define the line width
                // ctx.lineWidth = 2;
          
                // Draw the rectangular border
                // ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            }

            function drawUI() {
                const uiElements = uiContainer.children; //for now
                if (uiElements.length === 0) {
                    return; // No UI elements to draw
                }
                for(let i = 0; i < uiElements.length; i++){
                    const uiElement = uiElements[i];
                    const uiPosition = uiElementPositions[uiElement.id];
                    const regex = /chatbox/;
                    if(regex.test(uiElement.id)){
                        continue;
                    }
                    drawUIElement(uiElement, uiPosition.x, uiPosition.y);
                }
            }

            function withinBounds(x1,y1,x2,y2,i1,j1,i2,j2) {
                if (x1 < i2 && x2 > i1 && y1 < j2 && y2 > j1) {
                    console.log('collision detected');
                    return true;
                }
                console.log('collision not detected');

                return false;
            }
            function hideUIElement(uiElement) {
                uiElement.style.display = "none";
            }
            function showUIElement(uiElement) {
                uiElement.style.display = "block";
            }

            function drawPoem(texts, text_counter, aux_counter) {
                const chatbox_img = new Image();
                chatbox_img.id = 'chatbox';
                const x = 0;
                const screenHeight = canvas.height;
                const screenWidth = canvas.width;
                const chatboxHeight = screenHeight * 0.8;
                const chatboxWidth = screenWidth * 0.4;
                // const y = screenHeight - hpadding - chatboxHeight;
                const y = 0;
                chatbox_img.src = large_chatbox.src;
                for(uiElement of uiContainer.children){
                    const position = uiElementPositions[uiElement.id];
                    const x1 = position.x;
                    const y1 = position.y;
                    const x2 = position.x + uiElement.offsetWidth;
                    const y2 = position.y + uiElement.offsetHeight;
                    const regex = /chatbox/;
                    // const player_regex = /player/;
                    if(!regex.test(uiElement.id) &&
                        // !player_regex.test(uiElement.id) &&
                        withinBounds(x,y,x+chatboxWidth,y+chatboxHeight,x1,y1,x2,y2)){
                            console.log('hiding ui :', uiElement.id);
                            hideUIElement(uiElement);
                    }
                }

                // chatbox_img.onload = () => {                    
                //     ctx.globalCompositeOperation = "source-over";
                //     ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                //     let text_x = x + wpadding/2;
                //     let text_y = y + hpadding/2;
                //     const para_offset = (chatboxHeight-2*hpadding)/aux_counter;
                //     const font_size = 48;
                //     ctx.font = `${font_size}px MyCustomFontv1`;
                //     ctx.fillStyle = 'black';
                //     for(let i = 0; i < aux_counter; i++){
                //         const text = texts[text_counter*aux_counter + i];
                //         console.log('text :', text);
                //         ctx.fillText(text, text_x, text_y);
                //         text_y += para_offset;
                //     }
                // };
                // ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                const wpadding = 40;
                // const hpadding = 40;
                const hpadding = chatboxWidth/7;
                ctx.globalCompositeOperation = "source-over";
                ctx.drawImage(chatbox_img, 0, 0, chatboxWidth, chatboxHeight);
                let text_x = x + wpadding;
                let text_y = y + hpadding;
                const font_size = chatboxWidth/40;
                // const font_size = chatboxWidth/32;

                // const para_offset = 50;
                // const para_offset = chatboxHeight/aux_counter;
                const para_offset = hpadding;
                console.log('para :', para_offset);

                ctx.font = `${font_size}px MyCustomFontv1`;
                ctx.fillStyle = 'black';
                const max_letters = chatboxWidth/(font_size);
                for(let i = 0; i < aux_counter; i++){
                    console.log('text_counter :', text_counter);
                    let text = texts[text_counter*aux_counter + i];
                    let line = '';
                    let line_count = 0;
                    while(text?.length > 0){
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
                        text_y += font_size/4;
                    }     
                    console.log('text :', text);
                    text_y += para_offset;
                }
                // for(let i = 0; i < aux_counter; i++){
                //     let text = texts[text_counter*aux_counter + i];    
                //     let text_x = x + wpadding/2;
                //     let text_y = y + hpadding/2;
                //     const para_offset = (chatboxHeight-2*hpadding)/aux_counter;                  
                //     const font_size = 48;
                //     ctx.font = `${font_size}px MyCustomFontv1`;
                //     ctx.fillStyle = 'black';
                //     const max_letters = chatboxWidth/(font_size/2) - 5;
                //     let line = '';
                //     let line_count = 0;
                //     while(text?.length > 0){
                //         if(text.length > max_letters){
                //             line = text.slice(0, max_letters);
                //             // line += '-';
                //             text = text.slice(max_letters);
                //         }
                //         else{
                //             line = text;
                //             text = '';
                //         }
                //         ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                //         ctx.fillText(line, text_x, text_y + line_count*(font_size+hpadding/2) );
                //         line_count += 1;
                //     }     
                // }     
            }
            function drawChatBox(text) {
                const chatbox_img = new Image();
                chatbox_img.id = 'chatbox';
                const wpadding = 100;
                const hpadding = 40;
                const x = wpadding;
                const screenHeight = canvas.height;
                const screenWidth = canvas.width;
                const chatboxHeight = screenHeight/5;
                const chatboxWidth = screenWidth - 2*wpadding;
                const y = screenHeight - hpadding - chatboxHeight;
                chatbox_img.src = lower_chatbox.src;
                for(uiElement of uiContainer.children){
                    const position = uiElementPositions[uiElement.id];
                    const x1 = position.x;
                    const y1 = position.y;
                    const x2 = position.x + uiElement.offsetWidth;
                    const y2 = position.y + uiElement.offsetHeight;
                    const regex = /chatbox/;
                    const player_regex = /player/;
                    if(!regex.test(uiElement.id) &&
                        !player_regex.test(uiElement.id) &&
                        withinBounds(x,y,x+chatboxWidth,y+chatboxHeight,x1,y1,x2,y2)){
                            console.log('hiding ui :', uiElement.id);
                            hideUIElement(uiElement);
                    }
                }
                // chatbox_img.onload = () => {
                    
                //     ctx.globalCompositeOperation = "source-over";
                //     ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                //     const text_x = x + wpadding/2;
                //     const text_y = y + hpadding/2;
                //     const font_size = 20;
                //     ctx.font = `${font_size}px MyCustomFontv1`;
                //     ctx.fillStyle = 'black';
                //     ctx.fillText(text, text_x, text_y);
                // };
                ctx.drawImage(chatbox_img, x, y, chatboxWidth, chatboxHeight);
                const text_x = x + wpadding;
                const text_y = y + hpadding*2;                    
                const font_size = 20;
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
                // var x1 = playerX;
                // var y1 = playerY;
                // var x2 = playerX + playerWidth;
                // var y2 = playerY + playerHeight;
                // // Define the stroke color
                // ctx.strokeStyle = "blue"; // You can use other CSS color values
          
                // // Define the line width
                // ctx.lineWidth = 2;
          
                // // Draw the rectangular border
                // ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                // ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                // ctx.drawImage(characterImage, spriteX, spriteY, spriteWidth, spriteHeight, xUIRefPoint, yUIRefPoint, playerWidth, playerHeight);
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            // let lastFrameTime = 0;
            function updateGameArea(timestamp) {
                clearCanvas();
                
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                // drawCollisionMap();
                drawCollisionMap();
                
                drawBackground(); // Draw the background image first
                ctx.globalCompositeOperation = "source-atop"; // Set composite operation to "destination-over" for the collision map
                
                // drawPlayer(); // Draw the player on top of the collision map

                if(isInteractingWithText && text_counter < texts.length){
                    ctx.globalCompositeOperation = "source-atop"; // Set composite operation to "source-over"
                    if(isInteractingWithPoem){
                        const aux_counter = parseInt(texts[texts.length-1]);
                        drawPoem(texts, text_counter, aux_counter);
                    }
                    else{
                        drawChatBox(texts[text_counter]);
                    }
                }
                else{
                    drawUI();         
                    // Draw the player
                }
                drawPlayer();

                requestAnimationFrame(updateGameArea);
            }
            function drawBox(x, y, width, height, color) {
                const original_GCO = ctx.globalCompositeOperation;
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                ctx.fillStyle = color;
                ctx.fillRect(x, y, width, height);
               ctx.globalCompositeOperation = original_GCO;
            }
            
            function checkCollision(player, item, threshold = playerSpeed*0.25) {
                const playerLeft = player.left;
                const playerRight = player.right;
                const playerTop = player.top;
                const playerBottom = player.bottom;
              
                const itemLeft = item.left;
                const itemRight = item.right;
                const itemTop = item.top;
                const itemBottom = item.bottom;

                function abs(x){
                    if(x < 0) return -x;
                    return x;
                }
                switch (currentOrientation) {
                    case 'up':
                        
                        // Check if the player's top border collides with the UI's bottom border and they are aligned horizontally
                        if (
                                abs(playerTop - itemBottom) <= threshold 
                            && 
                                ( 
                                    (playerLeft >= itemLeft && playerRight <= itemRight) || 
                                    (playerRight >= itemLeft && playerRight <= itemRight) || 
                                    (playerLeft >= itemLeft && playerLeft <= itemRight) 
                                ) 
                            ){
                                return true; // Collision detected
                            }
                        break;
                    case 'down':
                        // Check if the player's bottom border collides with the UI's top border and they are aligned horizontally
                        if (
                            abs(itemTop - playerBottom) <= threshold  
                            && 

                            // playerBottom + threshold <= itemTop && playerBottom <= itemTop &&
                            ( (playerLeft >= itemLeft && playerRight <= itemRight) 
                            || (playerRight >= itemLeft && playerRight <= itemRight) 
                            || (playerLeft >= itemLeft && playerLeft <= itemRight) ) 
                            ) {
                            return true; // Collision detected
                        }
                        break;
                    case 'left':
                        // Check if the player's left border collides with the UI's right border and they are aligned vertically
                        if (
                            abs(playerLeft - itemRight) <= threshold  
                            && 

                            // playerLeft - threshold <= itemRight && playerLeft >= itemRight && 

                            ((playerTop >= itemTop && playerBottom <= itemBottom) || (playerTop >= itemTop && playerTop <= itemBottom) || playerBottom >= itemTop && playerBottom <= itemBottom) ) {
                            return true; // Collision detected
                        }
                        break;
                    case 'right':
                        // Check if the player's right border collides with the UI's left border and they are aligned vertically
                        if (
                            abs(playerRight - itemLeft) <= threshold  
                            && 

                            // playerRight + threshold >= itemLeft && playerRight <= itemLeft &&                             
                            ((playerTop >= itemTop && playerBottom <= itemBottom) 
                            || (playerTop >= itemTop && playerTop <= itemBottom) 
                            || playerBottom >= itemTop && playerBottom <= itemBottom) 
                            ) {
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
                    if(uiElement.dataset.walkable && uiElement.dataset.walkable  === "true") continue;

                    const uiPosition = uiElementPositions[uiElement.id];
                    const uiLeft = uiPosition.x;
                    const uiRight = uiPosition.x + uiElement.offsetWidth;
                    // const uiTop = uiPosition.y;
                    // const uiBottom = uiPosition.y - uiElement.offsetHeight;

                    // const uiTop = uiPosition.y + uiElement.offsetHeight;
                    // const uiBottom = uiPosition.y;

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
                    // const playerT = y + playerHeight;
                    // const playerB = y;

                    const playerT = y;
                    const playerB = y + playerHeight;
                    const p = {
                        'left' : playerL,
                        'right' : playerR,
                        'top' : playerT,
                        'bottom' : playerB,
                    };
                    if(checkCollision(p,ui)) return true
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
                    const uiPosition = uiElementPositions[uiElement.id];
                    // const uiPosition = getUIPosition(uiElement);
                    const uiLeft = uiPosition.x;
                    const uiRight = uiPosition.x + uiElement.offsetWidth;
                    const uiTop = uiPosition.y + uiElement.offsetHeight;
                    const uiBottom = uiPosition.y;
                    
                    // const uiTop = uiPosition.y;
                    // const uiBottom = uiPosition.y - uiElement.offsetHeight;
                    
                    const playerL = x;
                    const playerR = x + playerWidth;
                    const playerT = y;
                    const playerB = y + playerHeight;
                    // Define the proximity range for UI collision
                    const proximity = proximityRange;
            
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

            //collision check is very localised
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
                        if (text_counter < text_length - 1) {
                            text_counter += 1;
                        }
                        
                        else {
                            if(isInteractingWithPoem){
                                resetPoemInteraction();
                            }
                            else{
                                resetTextInteraction();
                            }
                        }
                    }
                }

                function resetPoemInteraction() {
                    console.log('reset poem UI');
                    isInteractingWithText = false;
                    isInteractingWithPoem = false;
                    text_counter = 0;
                    text_length = 0;
                    texts = [];
                    const x = 0;
                    const screenHeight = canvas.height;
                    const screenWidth = canvas.width;
                    const chatboxHeight = screenHeight * 0.8;
                    const chatboxWidth = screenWidth * 0.4;
                    // const y = screenHeight - hpadding - chatboxHeight;
                    const y = 0;
                    for(uiElement of uiContainer.children){
                        const position = uiElementPositions[uiElement.id];
                        const x1 = position.x;
                        const y1 = position.y;
                        const x2 = position.x + uiElement.offsetWidth;
                        const y2 = position.y + uiElement.offsetHeight;
                        const regex = /chatbox/;
                        if(!regex.test(uiElement.id) &&withinBounds(x,y,x+chatboxWidth,y+chatboxHeight,x1,y1,x2,y2)){
                            console.log('showing ui', uiElement.id);
                            showUIElement(uiElement);
                        }
                    }
                }

                function resetTextInteraction() {
                    console.log('reset Text UI');
                    isInteractingWithText = false;
                    text_counter = 0;
                    text_length = 0;
                    texts = [];
                    const wpadding = 100;
                    const hpadding = 40;
                    const x = wpadding;
                    const screenHeight = canvas.height;
                    const screenWidth = canvas.width;
                    const chatboxHeight = screenHeight/5;
                    const chatboxWidth = screenWidth - 2*wpadding;
                    const y = screenHeight - hpadding - chatboxHeight;
                    for(uiElement of uiContainer.children){
                        const position = uiElementPositions[uiElement.id];
                        const x1 = position.x;
                        const y1 = position.y;
                        const x2 = position.x + uiElement.offsetWidth;
                        const y2 = position.y + uiElement.offsetHeight;
                        const regex = /chatbox/;
                        console.log('showing ui');
                        if(!regex.test(uiElement.id) &&withinBounds(x,y,x+chatboxWidth,y+chatboxHeight,x1,y1,x2,y2)){
                            console.log('showing ui', uiElement.id);
                            showUIElement(uiElement);
                        }
                    }
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
                    
                    //collision function not making website laggy
                    const collision = isCollision(playerX, playerY, playerWidth, playerHeight) || hitUI(playerX, playerY);
                    const moved = (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight');
            
                    if (!collision && moved) {
                        updateUIpositions();
                        xUIRefPoint = newX;
                        yUIRefPoint = newY;
                        movementCount = _movement_count;
                        movementCount += 1;
                        movementCount %= no_of_frames;
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
                        // Check if the player is facing the UI and near UI
                        //better way to check collision here
                        if(uiElement.id==='angerpoem'){
                        console.log('uiDirection :', uiDirection);
                        console.log('uiPosition :', uiPosition);
                        console.log('playerPosition :', playerPosition);
                        console.log('currentOrientation :', currentOrientation);
                        console.log('absXDistance :', absXDistance**2);
                        console.log('absYDistance :', absYDistance**2);
                        console.log('proximityDistance :', proximityDistance**2);

                        }
                        if (currentOrientation === uiDirection && 
                            absXDistance**2 + absYDistance**2 <= proximityDistance**2) 
                        {
                            

                            // Perform the interaction for the UI element
                            // interactTextUI(event, uiElement);
                            const filepath = uiElement.dataset.response;
                            if (filepath !== '') {
                                try {
                                    // const response =  fetch(filepath).then(response => {
                                    fetch(filepath).then(response => {
                                        if (response.status === 200) {
                                            // console.log("response received:", response);
                                            response.text().then(data => {
                                                // console.log("data received:", data);
                                                const lines = data.split('\n');
                                                for (let i = 0; i < lines.length; i++) {
                                                    if (lines[i] !== '') {
                                                        texts.push(lines[i]);
                                                    }
                                                }
                                                console.log('interacting wth ui');
                                                isInteractingWithText = true;
                                                text_length = texts.length;
                                                if(uiElement.dataset.poem === 'true'){
                                                    isInteractingWithPoem = true;
                                                    const aux_counter = parseInt(texts[texts.length-1]);//no of sent. in para
                                                    console.log('numerator :', texts.length);
                                                    console.log('denominator :', aux_counter);
                                                    text_length = texts.length/aux_counter - 1;

                                                    console.log('text length :', text_length);
                                                }
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

