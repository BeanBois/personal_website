const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const uiContainer = document.getElementById("ui-container");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerWidth = 71;
const playerHeight = 100;
const playerSpeed = 10;
const proximityDistance = 50

const characterImages = {
    up: new Image(),
    down: new Image(),
    left: new Image(),
    right: new Image()
};

characterImages.up.src = "public/player_boy_1_.png"; // Update with character orientation images
characterImages.down.src = "public/player_boy_0_.png";
characterImages.left.src = "public/player_boy_2_.png";
characterImages.right.src = "public/player_boy_3_.png";
// characterImages.up.src = "public/moving_animation.png"; // Update with character orientation images
// characterImages.down.src = "public/moving_animation.png";
// characterImages.left.src = "public/moving_animation.png";
// characterImages.right.src = "public/moving_animation.png";
let currentOrientation = "down";


const backgroundImage = new Image();
backgroundImage.src = "public/Hoenn_Secret_Base_Alpha.png"; // Replace with the path to your background image

const collisionMapImage = new Image();
collisionMapImage.src = "public/collision_map.jpg"; // Replace with the path to your collision map image

function getUIPosition(uiElement) {
    const rect = uiElement.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
    };
}


let playerX = canvas.width / 2 - playerWidth / 2;
let playerY = canvas.height / 2 - playerHeight / 2;


characterImages[currentOrientation].onload = () =>{ 
    backgroundImage.onload = () => {
        collisionMapImage.onload = () => {
            
            function drawBackground() {
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            }
            let frameIndex = 0;
            const frameCount = 7; // Adjust this number based on the number of frames in your GIF
            const frameIncr = 10;
            const frameDelay = 10
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
                ctx.drawImage(collisionMapImage, 0, 0, canvas.width, canvas.height);
                
                ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                drawPlayer(); // Draw the player on top of the collision map
                    // lastFrameTime = timestamp;
                // }
                // requestAnimationFrame(updateGameArea);
                // setTimeout(updateGameArea, frameDelay);
            }
            // requestAnimationFrame(updateGameArea);

            function isCollision(x, y) {
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                ctx.drawImage(collisionMapImage, 0, 0, canvas.width, canvas.height);
                
                
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
                            ctx.drawImage(collisionMapImage, 0, 0, canvas.width, canvas.height);
                            ctx.globalCompositeOperation = "source-over"; // Set composite operation back to "source-over" for drawing the player
                            drawPlayer(); // Draw the player on top of the collision map
                            return true; // Collision detected at any point within the player's area
                        }
                    }
                }
                ctx.globalCompositeOperation = "source-over"; // Set composite operation to "source-over"
                
                drawBackground(); // Draw the background image first
                
                ctx.globalCompositeOperation = "destination-over"; // Set composite operation to "destination-over" for the collision map
                ctx.drawImage(collisionMapImage, 0, 0, canvas.width, canvas.height);
                
                return false; // No collision detected in the entire player area
            }

            window.addEventListener("keydown", (event) => {
                let newX = playerX;
                let newY = playerY;
                console.log(event.key);

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
                    console.log('x');
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
                        console.log(absXDistance, absYDistance, uiDirection);
                        // Check if the player is facing the same direction as the UI
                        if (currentOrientation === uiDirection && 
                            absXDistance <= proximityDistance && 
                            absYDistance <= proximityDistance) {
                            // Perform the interaction for the UI element
                            alert(`Interacted with ${uiElement.textContent}`);
                        }
                    }
                }

                if (!isCollision(newX, newY)) {
                    playerX = newX;
                    playerY = newY;
                    updateGameArea();
                }
            });

            updateGameArea();
        };
    };
}

