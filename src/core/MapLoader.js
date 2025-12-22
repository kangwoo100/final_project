import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class MapLoader {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.loader = new GLTFLoader();
        
        // Draco 압축 지원
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.loader.setDRACOLoader(dracoLoader);
        
        this.sceneModel = null;
    }

    async loadSceneModel() {
        return new Promise((resolve, reject) => {
            // github에 파일 경로 문제 해결
            const urlParams = new URLSearchParams(window.location.search);
            const isGitHubPages = window.location.hostname.includes('github.io') || urlParams.get('test') === 'github';
            const modelPath = isGitHubPages
                ? 'https://media.githubusercontent.com/media/kangwoo100/final_project/main/assets/models/Scene1.glb'
                : '../assets/models/Scene1.glb';
            
            console.log(`Loading model from: ${modelPath} (GitHub mode: ${isGitHubPages})`);
            
            this.loader.load(
                modelPath,
                (gltf) => {
                    this.sceneModel = gltf.scene;
                    // 그림자 설정 및 충돌 오브젝트 수집
                    this.sceneModel.traverse((child) => {
                        if (child.isMesh) {
                            // 모든 메시가 그림자를 드리우고 받도록 설정
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // 재질이 MeshStandardMaterial인지 확인하고 조명을 받도록 설정
                            if (child.material) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(mat => {
                                        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                                            mat.needsUpdate = true;
                                        }
                                    });
                                } else {
                                    if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                                        child.material.needsUpdate = true;
                                    }
                                }
                            }
                            
                            // 충돌 체크용 오브젝트 리스트에 추가
                            this.obstacles.push(child);
                        }
                    });
                    
                    this.scene.add(this.sceneModel);
                    console.log('Scene model loaded successfully');
                    console.log('Model:', this.sceneModel);
                    console.log('Collision objects:', this.obstacles.length);
                    
                    // 디버그: 메시 재질 정보 출력
                    this.sceneModel.traverse((child) => {
                        if (child.isMesh && child.material) {
                            console.log(`Mesh: ${child.name}, Material type: ${child.material.type}, Position Y: ${child.position.y.toFixed(2)}`);
                        }
                    });
                    
                    resolve(this.sceneModel);
                },
                (progress) => {
                    if (progress.total > 0) {
                        console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
                    }
                },
                (error) => {
                    console.error('Error loading scene model:', error);
                    reject(error);
                }
            );
        });
    }

    async createBasicMap() {
        // GLTF 씬 모델 로드
        await this.loadSceneModel();

        // 그리드 헬퍼 (개발용)
        const gridHelper = new THREE.GridHelper(50, 50);
        this.scene.add(gridHelper);
    }

    getObstacles() {
        return this.obstacles;
    }
}
