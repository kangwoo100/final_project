import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

/**
 * LightingManager - 조명 시스템 관리
 * 조명을 동적으로 추가하면 자동으로 GUI도 생성됨
 * 
 * 사용 예시:
 * const lightingManager = new LightingManager(scene, renderer);
 * 
 * // 조명 추가
 * const pointLight = new THREE.PointLight(0xffffff, 1, 50);
 * pointLight.position.set(0, 10, 0);
 * lightingManager.addLight('내 포인트 라이트', pointLight);
 * 
 * // 조명 제거
 * lightingManager.removeLight('내 포인트 라이트');
 */
export class LightingManager {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        
        // 조명 배열 (동적 관리)
        this.lights = [];
        
        // 현재 모드
        this.isDeveloperMode = false;
        
        // GUI
        this.gui = null;
        this.guiFolders = new Map();
    }
    
    /**
     * 조명 추가 (자동으로 GUI에도 추가됨)
     * @param {string} name - 조명 이름
     * @param {THREE.Light} light - Three.js 조명 객체
     * @param {Object} guiConfig - GUI 설정 (선택)
     */
    addLight(name, light, guiConfig = {}) {
        // 조명 저장
        const lightData = {
            name,
            light,
            guiConfig: {
                showColor: guiConfig.showColor !== false,
                showIntensity: guiConfig.showIntensity !== false,
                showDistance: guiConfig.showDistance !== false,
                showPosition: guiConfig.showPosition !== false,
                showCastShadow: guiConfig.showCastShadow !== false,
                maxIntensity: guiConfig.maxIntensity || 5,
                maxDistance: guiConfig.maxDistance || 50,
                positionRange: guiConfig.positionRange || 20,
                ...guiConfig
            }
        };
        
        this.lights.push(lightData);
        this.scene.add(light);
        
        // 개발자 모드면 GUI에 추가
        if (this.isDeveloperMode && this.gui) {
            this._addLightToGUI(lightData);
        }
        
        return light;
    }
    
    /**
     * 조명 제거
     * @param {string} name - 제거할 조명 이름
     */
    removeLight(name) {
        const index = this.lights.findIndex(l => l.name === name);
        if (index !== -1) {
            const lightData = this.lights[index];
            this.scene.remove(lightData.light);
            
            // GUI 폴더 제거
            if (this.guiFolders.has(name)) {
                const folder = this.guiFolders.get(name);
                folder.destroy();
                this.guiFolders.delete(name);
            }
            
            this.lights.splice(index, 1);
        }
    }
    
    /**
     * 이름으로 조명 가져오기
     * @param {string} name - 조명 이름
     */
    getLight(name) {
        const lightData = this.lights.find(l => l.name === name);
        return lightData ? lightData.light : null;
    }
    
    /**
     * 모든 조명 제거
     */
    clearAllLights() {
        [...this.lights].forEach(lightData => {
            this.removeLight(lightData.name);
        });
    }
    
    /**
     * GUI에 조명 추가
     */
    _addLightToGUI(lightData) {
        const { name, light, guiConfig } = lightData;
        
        const folder = this.gui.addFolder(name);
        this.guiFolders.set(name, folder);
        
        // 색상 (AmbientLight, PointLight, DirectionalLight 등)
        if (guiConfig.showColor && light.color) {
            folder.addColor({ color: light.color.getHex() }, 'color')
                .name('색상')
                .onChange((value) => {
                    light.color.setHex(value);
                });
        }
        
        // 강도
        if (guiConfig.showIntensity && light.intensity !== undefined) {
            folder.add(light, 'intensity', 0, guiConfig.maxIntensity, 0.1)
                .name('강도');
        }
        
        // 거리 (PointLight, SpotLight)
        if (guiConfig.showDistance && light.distance !== undefined) {
            folder.add(light, 'distance', 0, guiConfig.maxDistance, 1)
                .name('거리');
        }
        
        // 위치 (PointLight, SpotLight, DirectionalLight)
        if (guiConfig.showPosition && light.position) {
            const range = guiConfig.positionRange;
            folder.add(light.position, 'x', -range, range, 0.5)
                .name('위치 X');
            folder.add(light.position, 'y', 0, range, 0.5)
                .name('위치 Y');
            folder.add(light.position, 'z', -range, range, 0.5)
                .name('위치 Z');
        }
        
        // 그림자 캐스팅
        if (guiConfig.showCastShadow && light.castShadow !== undefined) {
            folder.add(light, 'castShadow')
                .name('그림자 생성');
        }
        
        // SpotLight 전용 설정
        if (light.isSpotLight) {
            if (guiConfig.showAngle !== false) {
                folder.add(light, 'angle', 0, Math.PI / 2, 0.01)
                    .name('각도 (angle)');
            }
            if (guiConfig.showPenumbra !== false) {
                folder.add(light, 'penumbra', 0, 1, 0.01)
                    .name('페넘브라 (penumbra)');
            }
        }
        
        // DirectionalLight 전용 설정
        if (light.isDirectionalLight && guiConfig.showTarget !== false) {
            const targetFolder = folder.addFolder('타겟');
            const targetRange = guiConfig.targetRange || 20;
            targetFolder.add(light.target.position, 'x', -targetRange, targetRange, 0.5)
                .name('타겟 X');
            targetFolder.add(light.target.position, 'y', -targetRange, targetRange, 0.5)
                .name('타겟 Y');
            targetFolder.add(light.target.position, 'z', -targetRange, targetRange, 0.5)
                .name('타겟 Z');
        }
        
        folder.open();
    }
    
    /**
     * 게임 모드 조명 설정
     */
    setupGameMode() {
        this.clearAllLights();
        
        // 배경 및 안개
        this.renderer.setClearColor(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.045);
        
        // 환경광
        const ambient = new THREE.AmbientLight(0x404060, 0.6);
        this.addLight('환경광 (Ambient)', ambient, {
            maxIntensity: 3
        });
        
        // 점광원 1
        const point1 = new THREE.PointLight(0x6677cc, 5, 20);
        point1.position.set(0, 5, 0);
        point1.castShadow = true;
        point1.shadow.mapSize.width = 512;
        point1.shadow.mapSize.height = 512;
        this.addLight('점광원 1 (중앙)', point1, {
            maxDistance: 50, maxIntensity:500
        });
        
    }
    
    /**
     * 개발자 모드 조명 설정 (기존 조명 유지하고 GUI만 추가)
     */
    setupDeveloperMode() {
        // 기존 GUI 제거
        if (this.gui) {
            this.gui.destroy();
            this.guiFolders.clear();
        }
        
        // GUI 생성
        this.gui = new GUI();
        this.gui.title('조명 컨트롤');
        
        // 장면 설정 폴더
        const sceneFolder = this.gui.addFolder('장면 설정');
        sceneFolder.addColor({ color: this.renderer.getClearColor(new THREE.Color()).getHex() }, 'color')
            .name('배경 색상')
            .onChange((value) => {
                this.renderer.setClearColor(value);
            });
        
        if (this.scene.fog) {
            sceneFolder.add(this.scene.fog, 'density', 0, 0.1, 0.001)
                .name('안개 밀도');
        }
        sceneFolder.open();
        
        this.isDeveloperMode = true;
        
        // 기존 조명들에 GUI 추가
        this.lights.forEach(lightData => {
            this._addLightToGUI(lightData);
        });
    }
    
    /**
     * 모드 토글
     */
    toggleMode() {
        if (this.isDeveloperMode) {
            // GUI만 제거하고 조명은 유지
            if (this.gui) {
                this.gui.destroy();
                this.gui = null;
                this.guiFolders.clear();
            }
            this.isDeveloperMode = false;
        } else {
            this.setupDeveloperMode();
        }
        return this.isDeveloperMode;
    }
    
    /**
     * 현재 모드 반환
     */
    getMode() {
        return this.isDeveloperMode ? 'developer' : 'game';
    }
}
