const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const uiContainer = document.getElementById("ui-container");



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerWidth = 71;
const playerHeight = 100;
const playerSpeed = 10;
const proximityDistance = 150
const collisionProximity = 30;

const characterImages = {
    up: new Image(),
    down: new Image(),
    left: new Image(),
    right: new Image()
};

characterImages.up.src = "public/player/player_boy_1_.png"; // Update with character orientation images
characterImages.down.src = "public/player/player_boy_0_.png";
characterImages.left.src = "public/player/player_boy_2_.png";
characterImages.right.src = "public/player/player_boy_3_.png";
// characterImages.up.src = "public/player/moving_animation.png"; // Update with character orientation images
// characterImages.down.src = "public/player/moving_animation.png";
// characterImages.left.src = "public/player/moving_animation.png";
// characterImages.right.src = "public/player/moving_animation.png";
let currentOrientation = "down";


const backgroundImage = new Image();
backgroundImage.src = "public/maps/gamma/Hoenn_Secret_Base_Gamma.png"; // Replace with the path to your background image

const collisionMapImage = new Image();
collisionMapImage.src = "public/maps/gamma/collision_map_gamma.jpg"; // Replace with the path to your collision map image

// Define the screen's width and height (your sliding window dimensions)
const screenWidth = canvas.width;
const screenHeight = canvas.height;

let playerX = canvas.width / 2 - playerWidth / 2;
let playerY = canvas.height / 2 - playerHeight / 2;
let screenX = 0;
let screenY = 0;
const stopThreshold = 0;
const scale = 10;


//UI
function getUIPosition(uiElement) {
    const rect = uiElement.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
    };
}

const uiElementPositions = {};

// Iterate through the UI elements in the uiContainer
Array.from(uiContainer.children).forEach((uiElement) => {
    const uiPosition = getUIPosition(uiElement);

    // Store the UI element's position in the object with the element's id as the key
    uiElementPositions[uiElement.id] = uiPosition;
});

function pngToScreen(x, y, imageScale=scale, screenWidth=screenWidth, screenHeight=screenHeight) {
    // Calculate the scaled coordinates
    const scaledX = x * imageScale;
    const scaledY = y * imageScale;

    // Calculate the position on the screen
    const screenX = (screenWidth - scaledX) / 2;
    const screenY = (screenHeight - scaledY) / 2;

    // Return the screen coordinates as an object
    return { x: screenX, y: screenY };
}



//main functions
characterImages[currentOrientation].onload = () =>{ 
    backgroundImage.onload = () => {
        collisionMapImage.onload = () => {
            
            function drawBackground() {
                const zoomScale = scale;
                // Calculate the position and size of the zoomed background image
                const zoomedWidth = backgroundImage.width * zoomScale;
                const zoomedHeight = backgroundImage.height * zoomScale;

                // Calculate the position of the zoomed background image center
                const zoomedCenterX = playerX - 0 * zoomScale;
                const zoomedCenterY = playerY - 0 * zoomScale;
            
                // Calculate the draw position on the canvas to center the zoomed background image
                const drawX = canvas.width / 2 - zoomedCenterX;
                const drawY = canvas.height / 2 - zoomedCenterY;

                // Draw the zoomed background image
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
                const zoomedCenterX = playerX - 0 * zoomScale;
                const zoomedCenterY = playerY - 0 * zoomScale;
            
                // Calculate the draw position on the canvas to center the zoomed background image
                const drawX = canvas.width / 2 - zoomedCenterX;
                const drawY = canvas.height / 2 - zoomedCenterY;

            
                // Draw the zoomed background image
                ctx.drawImage(
                    collisionMapImage, 
                    0, 0, 
                    collisionMapImage.width, collisionMapImage.height, 
                    drawX, drawY, 
                    zoomedWidth, zoomedHeight);

            }
            // let frameIndex = 0;
            // const frameCount = 7; // Adjust this number based on the number of frames in your GIF
            // const frameIncr = 10;
            // const frameDelay = 10
            // function drawPlayer() {

            //     const spriteWidth = characterImages[currentOrientation].width / frameCount;
            //     const spriteHeight = characterImages[currentOrientation].height;

            //     ctx.drawImage(
            //         characterImages[currentOrientation],
            //         frameIndex * spriteWidth,
            //         0,
            //         spriteWidth,
            //         spriteHeight,
            //         playerX,
            //         playerY,
            //         playerWidth,
            //         playerHeight
            //     );

            //     frameIndex = (frameIndex + frameIncr) % frameCount;
                
            //     requestAnimationFrame(drawPlayer);
            // }

            function updateUIpositions() {
                for(let i = 0; i < uiContainer.children.length; i++){
                    if(!(uiContainer.children[i].id in uiElementPositions)){
                        const uiElement = uiContainer.children[i];
                        const uiPosition = getUIPosition(uiElement);
                        uiElementPositions[uiElement.id] = uiPosition;
                        console.log('added new element');
                    }
                    else{
                        const uiElement = uiContainer.children[i];
                        const _uiPosition = uiElementPositions[uiElement.id];
                        switch(currentOrientation){
                            case 'up':
                                _uiPosition.x += playerSpeed;
                                break;
                            case 'down':
                                _uiPosition.x -= playerSpeed;
                                break;
                            case 'left':
                                _uiPosition.y += playerSpeed;
                                break;
                            case 'right':
                                _uiPosition.y -= playerSpeed;
                                break;
                        }
                        uiElementPositions[uiElement.id] = _uiPosition;
                        console.log('done');
                    }
                }
            }   

            function drawUIElement(uiElement, x, y) {
                const zoomScale = scale;
                const img = new Image();
                img.src = uiElement.src;
                //current position of ui
                const width = uiElement.width;
                const height = uiElement.height;
                uiElement.style.top = `${x}px`;
                uiElement.style.left = `${y}px`;
                img.onload = () => {
                    ctx.drawImage(img, x, y, width, height);
                };
            }

            function drawUI() {
                const uiElements = uiContainer.children; //for now
                if (uiElements.length === 0) {
                    return; // No UI elements to draw
                }
                for(let i = 0; i < uiElements.length; i++){
                    const uiElement = uiElements[i];
                    const uiPosition =  uiElementPositions[uiElement.id];
                    drawUIElement(uiElement, uiPosition.x, uiPosition.y);
                }
            }

            function drawPlayer() {
                // Draw the character using the character image
                ctx.drawImage(characterImages[currentOrientation], playerX, playerY, playerWidth, playerHeight);
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            // let lastFrameTime = 0;
            function updateGameArea(timestamp) {
                // if (timestamp - lastFrameTime >= frameDelay) {
                clearCanvas();
                    
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                drawBackground(); // Draw the background image first
                
                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                drawCollisionMap();

                
                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                drawUI();
                drawPlayer(); // Draw the player on top of the collision map

                    // lastFrameTime = timestamp;
                // }
                requestAnimationFrame(updateGameArea);
                // setTimeout(updateGameArea, frameDelay);
            }
            // requestAnimationFrame(updateGameArea);

            function _is_collision_ui(x,y, proximityRange = collisionProximity ){
                    // Check collision with UI elements
                if (uiContainer.children.length === 0) {
                    return false; // No UI elements to check for collision with
                }
                for (const uiElement of uiContainer.children) {
                    const uiPosition = getUIPosition(uiElement);
                    const uiLeft = uiPosition.x;
                    const uiRight = uiPosition.x + uiElement.width;
                    const uiTop = uiPosition.y;
                    const uiBottom = uiPosition.y + uiElement.height;
                    
                    // Define the proximity range for UI collision
                    const proximity = proximityRange;
            
                    // Check if the player's bounding box overlaps with the UI element considering proximity
                    if (
                        playerX + playerWidth + proximity > uiLeft &&
                        playerX - proximity < uiRight &&
                        playerY + playerHeight + proximity > uiTop &&
                        playerY - proximity < uiBottom
                    ) {
                        return true; // Collision with a UI element detected within proximity range
                    }
                }
                return false; // No 
                return false; // No collision with UI elements detected
            }

            function isCollision(x, y) {
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                drawCollisionMap();

                
                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                drawBackground(); // Draw the background image first
                
                for (let i = 0; i < playerWidth; i++) {
                    for (let j = 0; j < playerHeight; j++) {
                        const pixelData = ctx.getImageData(x + i, y + j, 1, 1).data;
                        // Customize this check based on the color of your walls in the collision map image
                        if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
                            ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                            drawBackground(); // Draw the background image first
                            
                            ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                            drawCollisionMap();

                            ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                            drawPlayer(); // Draw the player on top of the collision map
                            return true; // Collision detected at any point within the player's area
                        }
                    }
                }
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                drawBackground(); // Draw the background image first
                
                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                drawCollisionMap();

                return false; // No collision detected in the entire player area
                
                //till here no collisioin with map
                // const uiCollision = _is_collision_ui(x,y);
                // return uiCollision; // No collision detected in the entire player area
            }

            
            function calculateScreenPosition() {
                const zoomScale = scale;
                screenX = playerX - canvas.width / (2 * zoomScale); // Adjust for zoom
                screenY = playerY - canvas.height / (2 * zoomScale); // Adjust for zoom
            
                // // Adjust the boundaries for stopping the window
                // if (screenX <= stopThreshold) {
                //     screenX = 0;
                // }
                // if (screenX >= backgroundImage.width * 2 - screenWidth - stopThreshold) {
                //     screenX = backgroundImage.width * 2 - screenWidth;
                // }
                // if (screenY <= stopThreshold) {
                //     screenY = 0;
                // }
                // if (screenY >= backgroundImage.height - screenHeight - stopThreshold) {
                //     screenY = backgroundImage.height - screenHeight;
                // }
            }

            window.addEventListener("keydown", (event) => {
                let newX = playerX;
                let newY = playerY;

                if (event.key === "ArrowLeft") {
                    newX -= playerSpeed;
                    currentOrientation = "left";
                } else if (event.key === "ArrowRight") {
                    newX += playerSpeed;
                    currentOrientation = "right";
                } else if (event.key === "ArrowUp") {
                    newY -= playerSpeed;
                    currentOrientation = "up";
                } else if (event.key === "ArrowDown") {
                    newY += playerSpeed;
                    currentOrientation = "down";
                }
                else if (event.key === 'x') {
                    // Loop through the children of the UI container and check if the player is facing them and within proximity
                    playerPosition = {x : playerX, y : playerY};
                    for (let i = 0; i < uiContainer.children.length; i++) {
                        const uiElement = uiContainer.children[i];
                        const uiPosition = getUIPosition(uiElement);
                        const xDistance = playerPosition.x - uiPosition.x;
                        const yDistance = playerPosition.y - uiPosition.y;
                        
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
                        console.log(absXDistance, absYDistance, uiDirection)
                        // Check if the player is facing the same direction as the UI
                        if (currentOrientation === uiDirection && 
                            absXDistance <= proximityDistance && 
                            absYDistance <= proximityDistance) {
                            // Perform the interaction for the UI element
                            alert(`Interacted with ${uiElement.className}`);
                            break;
                        }
                    }
                }
                calculateScreenPosition();
                updateUIpositions();

                if (!isCollision(newX, newY)) {
                    playerX = newX;
                    playerY = newY;
                    updateGameArea();
                }
                else{
                    switch(currentOrientation){
                        case 'up':
                            playerY += playerSpeed;
                            updateGameArea();
                            break;
                        case 'down':
                            playerY -= playerSpeed;
                            updateGameArea();

                            break;
                        case 'left':
                            playerX += playerSpeed;
                            updateGameArea();

                            break;
                        case 'right':
                            playerX -= playerSpeed;
                            updateGameArea();

                            break;
                        default:
                            break;
                    }
                    
                }
            });

            // updateGameArea();
            requestAnimationFrame(updateGameArea);

        };
    };
}

