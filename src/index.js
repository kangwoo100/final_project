import * as THREE from 'three';
import { Player } from './objects/Player.js';
import { Spotlight } from './objects/Spotlight.js';
import { GameManager } from './core/GameManager.js';
import { MapLoader } from './core/MapLoader.js';
import { LightingManager } from './core/LightingManager.js';
import { ItemManager } from './core/ItemManager.js';
import { HUD } from './ui/HUD.js';
import { EventManager } from './core/EventManager.js';
import { RendererManager } from './core/RendererManager.js';
import { GameConfig } from './config/GameConfig.js';

class Game {
    constructor() {
        // Core managers (의존성 주입 순서 중요)
        this.eventManager = new EventManager();
        this.rendererManager = new RendererManager(this.eventManager);
        
        this.scene = new THREE.Scene();
        this.camera = null;
        this.player = null;
        this.spotlight = null;
        this.gameManager = null;
        this.itemManager = null;
        this.hud = null;
        this.clock = new THREE.Clock();
        
        // 조명 매니저
        this.lightingManager = null;
        
        this.init();
    }

    async init() {
        // 조명 매니저 초기화 (게임 모드)
        this.lightingManager = new LightingManager(this.scene, this.rendererManager.getRenderer());
        this.lightingManager.setupGameMode();

        // 맵 로드 (비동기)
        const mapLoader = new MapLoader(this.scene);
        await mapLoader.createBasicMap();

        // 플레이어 생성 (맵의 충돌 오브젝트 전달)
        this.player = new Player(this.scene, this.camera, this.rendererManager.getRenderer(), mapLoader.getObstacles());
        this.camera = this.player.camera;
        
        // RendererManager에 카메라 설정
        this.rendererManager.setScene(this.scene);
        this.rendererManager.setCamera(this.camera);

        // 스포트라이트 생성 (GameConfig 사용)
        const spotConfig = GameConfig.SPOTLIGHT;
        this.spotlight = new Spotlight(this.scene, this.player, {
            obstacles: mapLoader.getObstacles(),
            startPosition: new THREE.Vector3(
                spotConfig.START_POSITION.x,
                spotConfig.START_POSITION.y,
                spotConfig.START_POSITION.z
            ),
            height: spotConfig.HEIGHT,
            angle: spotConfig.ANGLE,
            intensity: spotConfig.INTENSITY,
            distance: spotConfig.DISTANCE,
            moveSpeed: spotConfig.MOVE_SPEED,
            chaseSpeed: spotConfig.CHASE_SPEED,
            normalColor: spotConfig.NORMAL_COLOR,
            alertColor: spotConfig.ALERT_COLOR,
            acceleration: spotConfig.ACCELERATION,
            damping: spotConfig.DAMPING,
            enableConeVisualization: spotConfig.ENABLE_CONE_VISUALIZATION
        });

        // 아이템 매니저 (EventManager 주입)
        this.itemManager = new ItemManager(this.scene, this.eventManager);
        this.player.setItemManager(this.itemManager);

        // 게임 매니저 (EventManager 주입)
        this.gameManager = new GameManager(this.eventManager, this.player, this.spotlight);

        // HUD (EventManager 주입)
        this.hud = new HUD(this.player, this.gameManager, this.itemManager, this.eventManager);
        
        // 게임 이벤트 구독
        this.setupGameEvents();
        
        // 모드 토글 버튼 설정
        this.setupModeToggle();
        
        // 게임 시작
        this.animate();
    }
    
    setupGameEvents() {
        // 게임 승리 이벤트
        this.eventManager.on(GameConfig.EVENTS.GAME_WIN, () => {
            this.showWinScreen();
        }, this);
    }
    
    setupModeToggle() {
        // 버튼 생성
        const button = document.createElement('button');
        button.id = 'mode-toggle';
        button.textContent = '게임 모드';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 12px 24px;
            background: #2a2a3e;
            color: white;
            border: 2px solid #5566bb;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s;
        `;
        
        button.addEventListener('click', () => {
            this.lightingManager.toggleMode();
            const mode = this.lightingManager.getMode();
            
            // 플레이어 개발자 모드도 함께 전환
            this.player.setDeveloperMode(mode === 'developer');
            
            button.textContent = mode === 'developer' ? '개발자 모드' : '게임 모드';
            button.style.background = mode === 'developer' ? '#4a4a5e' : '#2a2a3e';
        });
        
        button.addEventListener('mouseenter', () => {
            const mode = this.lightingManager.getMode();
            button.style.background = mode === 'developer' ? '#5a5a6e' : '#3a3a4e';
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            const mode = this.lightingManager.getMode();
            button.style.background = mode === 'developer' ? '#4a4a5e' : '#2a2a3e';
            button.style.transform = 'scale(1.0)';
        });
        
        document.body.appendChild(button);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // 업데이트
        if (this.gameManager.isPlaying()) {
            this.player.update(delta);
            this.spotlight.update(delta);
            this.gameManager.update(delta);
            this.itemManager.update(delta);
        }

        this.hud.update();

        // 렌더링 (RendererManager 사용)
        this.rendererManager.render();
    }
    
    showWinScreen() {
        // 승리 화면 표시
        const winScreen = document.createElement('div');
        winScreen.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #4af626;
            padding: 40px 60px;
            border: 3px solid #4af626;
            border-radius: 15px;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            z-index: 2000;
            box-shadow: 0 0 30px rgba(74, 246, 38, 0.5);
        `;
        winScreen.innerHTML = `
            <div>🎉 축하합니다! 🎉</div>
            <div style="font-size: 24px; margin-top: 20px;">모든 아이템을 수집했습니다!</div>
            <div style="font-size: 18px; margin-top: 30px; color: #aaa;">게임 클리어!</div>
        `;
        document.body.appendChild(winScreen);
    }
}

// 게임 시작
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
