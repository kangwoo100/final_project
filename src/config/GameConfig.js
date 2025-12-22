/**
 * GameConfig - 게임 설정 중앙 관리
 * Single Responsibility Principle: 모든 설정값을 한 곳에서 관리
 */
export class GameConfig {
    // 렌더러 설정
    static RENDERER = {
        ANTIALIAS: true,
        POWER_PREFERENCE: "high-performance",
        MAX_PIXEL_RATIO: 2,
        SHADOW_MAP_TYPE: 'PCFSoft',
        CLEAR_COLOR: 0x000000
    };

    // 카메라 설정
    static CAMERA = {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000
    };

    // 플레이어 설정
    static PLAYER = {
        HEIGHT: 1.8,
        WALK_SPEED: 5,
        SPRINT_SPEED: 8,
        MAX_STAMINA: 100,
        STAMINA_DRAIN_RATE: 20,
        STAMINA_RECOVERY_RATE: 15,
        INTERACT_DISTANCE: 3
    };

    // 스포트라이트 설정
    static SPOTLIGHT = {
        START_POSITION: { x: 0, y: 5, z: 0 },
        HEIGHT: 5,
        ANGLE: Math.PI / 12,
        INTENSITY: 800,
        DISTANCE: 30,
        MOVE_SPEED: 1.5,
        CHASE_SPEED: 2.5,
        NORMAL_COLOR: 0xffffff,
        ALERT_COLOR: 0xff0000,
        ACCELERATION: 15.0,
        DAMPING: 0.92,
        ENABLE_CONE_VISUALIZATION: true
    };

    // 게임 설정
    static GAME = {
        TOTAL_ITEMS: 3,
        SPOTLIGHT_ACTIVATION_DELAY: 2000, // ms
        DETECTION_TIME_TO_GAMEOVER: 3000 // ms
    };

    // 아이템 위치 설정
    static ITEM_POSITIONS = [
        { x: 5, y: 1, z: 5 },
        { x: -5, y: 1, z: -5 },
        { x: 8, y: 1, z: -8 }
    ];

    // HUD 설정
    static HUD = {
        STAMINA_BAR: {
            WIDTH: '300px',
            HEIGHT: '20px',
            BOTTOM: '30px',
            COLOR_HIGH: '#00ff00',
            COLOR_MED: '#ffff00',
            COLOR_LOW: '#ff0000',
            THRESHOLD_LOW: 0.2,
            THRESHOLD_MED: 0.5
        },
        ITEM_COUNTER: {
            TOP: '70px',
            LEFT: '20px',
            FONT_SIZE: '24px',
            BORDER_COLOR: '#ffd700',
            COLLECTED_COLOR: '#4af626'
        },
        DETECTION_WARNING: {
            FONT_SIZE: '48px',
            COLOR: '#ff0000',
            BLINK_SPEED: 0.01
        }
    };

    // 게임 상태
    static STATE = {
        INTRO: 'intro',
        PLAYING: 'playing',
        CAUGHT: 'caught',
        GAMEOVER: 'gameover',
        WIN: 'win'
    };

    // 이벤트 타입
    static EVENTS = {
        GAME_START: 'game:start',
        GAME_OVER: 'game:over',
        GAME_WIN: 'game:win',
        GAME_RESTART: 'game:restart',
        ITEM_COLLECTED: 'item:collected',
        PLAYER_DETECTED: 'player:detected',
        PLAYER_ESCAPED: 'player:escaped',
        STATE_CHANGED: 'state:changed'
    };
}
