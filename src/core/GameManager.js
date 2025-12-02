import { GameConfig } from '../config/GameConfig.js';

export const GameState = GameConfig.STATE;

export class GameManager {
    constructor(eventManager, player, spotlight) {
        this.eventManager = eventManager;
        this.player = player;
        this.spotlight = spotlight;
        
        this.state = GameState.INTRO;
        this.itemsCollected = 0;
        this.totalItems = GameConfig.GAME.TOTAL_ITEMS;
        
        this.hasStarted = false;
        
        // 이벤트 리스너
        this.setupEvents();
    }

    setupEvents() {
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && this.state === GameState.INTRO) {
                this.startGame();
            }
            
            if (event.code === 'KeyR' && this.state === GameState.GAMEOVER) {
                this.restartGame();
            }
        });
        
        // EventManager 이벤트 구독
        this.eventManager.on(GameConfig.EVENTS.ITEM_COLLECTED, () => {
            this.onItemCollected();
        }, this);
        
        this.eventManager.on(GameConfig.EVENTS.PLAYER_DETECTED, () => {
            this.onPlayerDetected();
        }, this);
    }

    startGame() {
        console.log('Game Started!');
        this.changeState(GameState.PLAYING);
        this.hasStarted = true;
        
        // 게임 시작 이벤트 발생
        this.eventManager.emit(GameConfig.EVENTS.GAME_START);
        
        // 스포트라이트 활성화 (약간의 딜레이 후)
        setTimeout(() => {
            this.spotlight.activate();
            console.log('Spotlight activated!');
        }, GameConfig.GAME.SPOTLIGHT_ACTIVATION_DELAY);
    }

    changeState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        // 상태 변경 이벤트 발생
        this.eventManager.emit(GameConfig.EVENTS.STATE_CHANGED, {
            oldState,
            newState
        });
        
        console.log(`State changed: ${oldState} -> ${newState}`);
    }

    onItemCollected() {
        this.itemsCollected++;
        console.log(`Item collected! (${this.itemsCollected}/${this.totalItems})`);
        
        // 스포트라이트 난이도 증가
        if (this.spotlight.setDifficulty) {
            this.spotlight.setDifficulty(this.itemsCollected);
        }
        
        if (this.itemsCollected >= this.totalItems) {
            console.log('All items collected! Find the exit!');
            this.changeState(GameState.WIN);
            this.eventManager.emit(GameConfig.EVENTS.GAME_WIN);
        }
    }

    onPlayerDetected() {
        if (this.state !== GameState.PLAYING) return;
        
        this.changeState(GameState.CAUGHT);
        console.log('Player caught!');
        
        // 일정 시간 후 게임오버
        setTimeout(() => {
            this.changeState(GameState.GAMEOVER);
            this.eventManager.emit(GameConfig.EVENTS.GAME_OVER);
        }, GameConfig.GAME.DETECTION_TIME_TO_GAMEOVER);
    }

    restartGame() {
        console.log('Restarting game...');
        this.itemsCollected = 0;
        this.changeState(GameState.INTRO);
        this.hasStarted = false;
        
        // 재시작 이벤트 발생
        this.eventManager.emit(GameConfig.EVENTS.GAME_RESTART);
        
        // 플레이어 위치 초기화
        this.player.camera.position.set(0, 1.6, 5);
        
        // 스포트라이트 초기화
        this.spotlight.isActive = false;
        if (this.spotlight.setDifficulty) {
            this.spotlight.setDifficulty(0);
        }
        if (this.spotlight.setAlert) {
            this.spotlight.setAlert(false);
        }
    }

    update(delta) {
        if (this.state !== GameState.PLAYING) return;
    }

    isPlaying() {
        return this.state === GameState.PLAYING;
    }

    getState() {
        return this.state;
    }

    getItemsCollected() {
        return this.itemsCollected;
    }

    getTotalItems() {
        return this.totalItems;
    }
}
