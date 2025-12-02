import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';

/**
 * RendererManager - Three.js 렌더러 관리
 * Single Responsibility Principle: 렌더링 관련 책임만 담당
 */
export class RendererManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        this.initRenderer();
        this.setupEventListeners();
    }

    /**
     * 렌더러 초기화
     */
    initRenderer() {
        const config = GameConfig.RENDERER;
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: config.ANTIALIAS,
            powerPreference: config.POWER_PREFERENCE
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.MAX_PIXEL_RATIO));
        this.renderer.shadowMap.enabled = true;
        
        // Shadow map type 설정
        switch(config.SHADOW_MAP_TYPE) {
            case 'PCFSoft':
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
            case 'PCF':
                this.renderer.shadowMap.type = THREE.PCFShadowMap;
                break;
            case 'Basic':
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            default:
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        this.renderer.setClearColor(config.CLEAR_COLOR);
        
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Scene 설정
     * @param {THREE.Scene} scene - Three.js Scene
     */
    setScene(scene) {
        this.scene = scene;
    }

    /**
     * Camera 설정
     * @param {THREE.Camera} camera - Three.js Camera
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * 렌더링 실행
     */
    render() {
        if (!this.scene || !this.camera) {
            console.warn('RendererManager: Scene or Camera not set');
            return;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 창 크기 변경 처리
     */
    onWindowResize() {
        if (!this.camera) {
            return;
        }

        // PerspectiveCamera인 경우
        if (this.camera.isPerspectiveCamera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // 리사이즈 이벤트 발생
        if (this.eventManager) {
            this.eventManager.emit('renderer:resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
    }

    /**
     * 렌더러 정리
     */
    dispose() {
        window.removeEventListener('resize', () => this.onWindowResize());
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }

    /**
     * 렌더러 객체 반환
     * @returns {THREE.WebGLRenderer}
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * 캔버스 DOM 요소 반환
     * @returns {HTMLCanvasElement}
     */
    getDomElement() {
        return this.renderer.domElement;
    }
}
