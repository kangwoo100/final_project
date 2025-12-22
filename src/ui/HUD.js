import { GameConfig } from '../config/GameConfig.js';

const GameState = GameConfig.STATE;

export class HUD {
    constructor(player, gameManager, itemManager, eventManager) {
        this.player = player;
        this.gameManager = gameManager;
        this.itemManager = itemManager;
        this.eventManager = eventManager;
        
        this.createHUD();
        this.setupEvents();
    }
    
    setupEvents() {
        // 상태 변경 이벤트 구독
        this.eventManager.on(GameConfig.EVENTS.STATE_CHANGED, (data) => {
            this.onStateChanged(data);
        }, this);
        
        // 리사이즈 이벤트 구독
        this.eventManager.on('renderer:resize', () => {
            this.onResize();
        }, this);
    }
    
    onStateChanged(data) {
        const { newState } = data;
        
        // 인트로 화면 처리
        if (newState === GameState.INTRO) {
            this.introScreen.style.display = 'flex';
        } else {
            this.introScreen.style.display = 'none';
        }
        
        // 게임오버 화면 처리
        if (newState === GameState.GAMEOVER) {
            this.gameOverScreen.style.display = 'flex';
        } else {
            this.gameOverScreen.style.display = 'none';
        }
        
        // 게임 클리어 화면 처리
        if (newState === GameState.WIN) {
            this.gameClearScreen.style.display = 'flex';
        } else {
            this.gameClearScreen.style.display = 'none';
        }
    }

    createHUD() {
        // HUD 컨테이너
        this.container = document.createElement('div');
        this.container.id = 'hud';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.color = 'white';
        document.body.appendChild(this.container);

        // 스테미나 바
        this.createStaminaBar();

        // 아이템 카운터
        this.createItemCounter();

        // 감지 경고
        this.createDetectionWarning();

        // 인트로 화면
        this.createIntroScreen();

        // 게임오버 화면
        this.createGameOverScreen();
        
        // 게임 클리어 화면
        this.createGameClearScreen();
    }

    createStaminaBar() {
        const staminaContainer = document.createElement('div');
        staminaContainer.style.position = 'absolute';
        staminaContainer.style.bottom = '30px';
        staminaContainer.style.left = '50%';
        staminaContainer.style.transform = 'translateX(-50%)';
        staminaContainer.style.width = '300px';
        staminaContainer.style.height = '20px';
        staminaContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        staminaContainer.style.border = '2px solid white';
        staminaContainer.style.borderRadius = '10px';
        staminaContainer.style.overflow = 'hidden';

        this.staminaBar = document.createElement('div');
        this.staminaBar.style.width = '100%';
        this.staminaBar.style.height = '100%';
        this.staminaBar.style.backgroundColor = '#00ff00';
        this.staminaBar.style.transition = 'width 0.1s, background-color 0.3s';

        staminaContainer.appendChild(this.staminaBar);
        this.container.appendChild(staminaContainer);

        // 스테미나 텍스트
        const staminaText = document.createElement('div');
        staminaText.textContent = 'STAMINA';
        staminaText.style.position = 'absolute';
        staminaText.style.bottom = '55px';
        staminaText.style.left = '50%';
        staminaText.style.transform = 'translateX(-50%)';
        staminaText.style.fontSize = '12px';
        staminaText.style.textShadow = '2px 2px 4px black';
        this.container.appendChild(staminaText);
    }

    createItemCounter() {
        this.itemCounter = document.createElement('div');
        this.itemCounter.style.position = 'absolute';
        this.itemCounter.style.top = '70px';
        this.itemCounter.style.left = '20px';
        this.itemCounter.style.fontSize = '24px';
        this.itemCounter.style.fontWeight = 'bold';
        this.itemCounter.style.textShadow = '2px 2px 4px black';
        this.itemCounter.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.itemCounter.style.padding = '10px 15px';
        this.itemCounter.style.borderRadius = '8px';
        this.itemCounter.style.border = '2px solid #ffd700';
        this.itemCounter.textContent = '📦 Items: 0/3';
        this.container.appendChild(this.itemCounter);
    }

    createDetectionWarning() {
        this.detectionWarning = document.createElement('div');
        this.detectionWarning.style.position = 'absolute';
        this.detectionWarning.style.top = '50%';
        this.detectionWarning.style.left = '50%';
        this.detectionWarning.style.transform = 'translate(-50%, -50%)';
        this.detectionWarning.style.fontSize = '48px';
        this.detectionWarning.style.fontWeight = 'bold';
        this.detectionWarning.style.color = '#ff0000';
        this.detectionWarning.style.textShadow = '4px 4px 8px black';
        this.detectionWarning.style.display = 'none';
        this.detectionWarning.textContent = '! DETECTED !';
        this.container.appendChild(this.detectionWarning);
    }

    createIntroScreen() {
        this.introScreen = document.createElement('div');
        this.introScreen.style.position = 'absolute';
        this.introScreen.style.top = '0';
        this.introScreen.style.left = '0';
        this.introScreen.style.width = '100%';
        this.introScreen.style.height = '100%';
        this.introScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.introScreen.style.display = 'flex';
        this.introScreen.style.flexDirection = 'column';
        this.introScreen.style.justifyContent = 'center';
        this.introScreen.style.alignItems = 'center';
        this.introScreen.style.pointerEvents = 'auto';

        const title = document.createElement('h1');
        title.textContent = 'AVOID THE SPOTLIGHT';
        title.style.fontSize = '48px';
        title.style.marginBottom = '30px';
        title.style.color = '#ff0000';
        title.style.textShadow = '4px 4px 8px black';

        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <p style="margin: 10px 0;">WASD - Move</p>
            <p style="margin: 10px 0;">SHIFT - Sprint (uses stamina)</p>
            <p style="margin: 10px 0;">F - Interact</p>
            <p style="margin: 10px 0;">Collect 3 items to escape</p>
            <p style="margin: 10px 0;">Avoid the spotlight!</p>
            <p style="margin: 30px 0; font-size: 20px; color: #ffff00;">Press SPACE to start</p>
        `;
        instructions.style.fontSize = '18px';
        instructions.style.textAlign = 'center';
        instructions.style.lineHeight = '1.5';

        this.introScreen.appendChild(title);
        this.introScreen.appendChild(instructions);
        this.container.appendChild(this.introScreen);
    }

    createGameOverScreen() {
        this.gameOverScreen = document.createElement('div');
        this.gameOverScreen.style.position = 'absolute';
        this.gameOverScreen.style.top = '0';
        this.gameOverScreen.style.left = '0';
        this.gameOverScreen.style.width = '100%';
        this.gameOverScreen.style.height = '100%';
        this.gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.gameOverScreen.style.display = 'none';
        this.gameOverScreen.style.flexDirection = 'column';
        this.gameOverScreen.style.justifyContent = 'center';
        this.gameOverScreen.style.alignItems = 'center';
        this.gameOverScreen.style.pointerEvents = 'auto';

        const title = document.createElement('h1');
        title.textContent = 'FAIL';
        title.style.fontSize = '128px';
        title.style.marginBottom = '30px';
        title.style.color = '#ff0000';
        title.style.textShadow = '6px 6px 12px black';
        title.style.fontWeight = 'bold';

        const restart = document.createElement('p');
        restart.textContent = 'Press R to restart';
        restart.style.fontSize = '24px';
        restart.style.color = '#ffffff';

        this.gameOverScreen.appendChild(title);
        this.gameOverScreen.appendChild(restart);
        this.container.appendChild(this.gameOverScreen);
    }

    createGameClearScreen() {
        this.gameClearScreen = document.createElement('div');
        this.gameClearScreen.style.position = 'absolute';
        this.gameClearScreen.style.top = '0';
        this.gameClearScreen.style.left = '0';
        this.gameClearScreen.style.width = '100%';
        this.gameClearScreen.style.height = '100%';
        this.gameClearScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.gameClearScreen.style.display = 'none';
        this.gameClearScreen.style.flexDirection = 'column';
        this.gameClearScreen.style.justifyContent = 'center';
        this.gameClearScreen.style.alignItems = 'center';
        this.gameClearScreen.style.pointerEvents = 'auto';

        const title = document.createElement('h1');
        title.textContent = 'Game Clear';
        title.style.fontSize = '128px';
        title.style.marginBottom = '30px';
        title.style.color = '#00ff00';
        title.style.textShadow = '6px 6px 12px black';
        title.style.fontWeight = 'bold';

        const restart = document.createElement('p');
        restart.textContent = 'Press R to restart';
        restart.style.fontSize = '24px';
        restart.style.color = '#ffffff';

        this.gameClearScreen.appendChild(title);
        this.gameClearScreen.appendChild(restart);
        this.container.appendChild(this.gameClearScreen);
    }

    update() {
        const state = this.gameManager.getState();

        // 게임 플레이 중 HUD만 업데이트 (상태 변경은 이벤트로 처리됨)
        if (state === GameState.PLAYING) {
            // 스테미나 업데이트
            const staminaPercent = this.player.getStaminaPercent();
            this.staminaBar.style.width = `${staminaPercent * 100}%`;
            
            const config = GameConfig.HUD.STAMINA_BAR;
            // 스테미나 색상 변경
            if (staminaPercent < config.THRESHOLD_LOW) {
                this.staminaBar.style.backgroundColor = config.COLOR_LOW;
            } else if (staminaPercent < config.THRESHOLD_MED) {
                this.staminaBar.style.backgroundColor = config.COLOR_MED;
            } else {
                this.staminaBar.style.backgroundColor = config.COLOR_HIGH;
            }

            // 아이템 카운터
            const progress = this.itemManager.getProgress();
            this.itemCounter.textContent = `📦 Items: ${progress.collected}/${progress.total}`;
            
            const itemConfig = GameConfig.HUD.ITEM_COUNTER;
            // 아이템 수집 시 색상 변화
            if (progress.collected === progress.total) {
                this.itemCounter.style.borderColor = itemConfig.COLLECTED_COLOR;
                this.itemCounter.style.color = itemConfig.COLLECTED_COLOR;
            } else {
                this.itemCounter.style.borderColor = itemConfig.BORDER_COLOR;
                this.itemCounter.style.color = 'white';
            }

            // 감지 경고
            if (this.player.inSpotlight) {
                this.detectionWarning.style.display = 'block';
                // 깜빡임 효과
                const time = Date.now();
                const blinkSpeed = GameConfig.HUD.DETECTION_WARNING.BLINK_SPEED;
                this.detectionWarning.style.opacity = 
                    Math.sin(time * blinkSpeed) * 0.5 + 0.5;
            } else {
                this.detectionWarning.style.display = 'none';
            }
        }
    }

    onResize() {
        // 필요시 리사이즈 처리
    }
}
