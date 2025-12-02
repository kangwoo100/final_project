import * as THREE from 'three';
import { Item } from '../objects/Item.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * ItemManager 클래스 - 아이템 생성 및 수집 관리
 */
export class ItemManager {
    constructor(scene, eventManager) {
        this.scene = scene;
        this.eventManager = eventManager;
        this.items = [];
        this.collectedCount = 0;
        this.totalItems = GameConfig.GAME.TOTAL_ITEMS;
        
        // 게임 시작 시 아이템 생성
        this.setupEvents();
    }
    
    setupEvents() {
        // 게임 시작 시 아이템 생성
        this.eventManager.on(GameConfig.EVENTS.GAME_START, () => {
            this.createItems();
        }, this);
        
        // 게임 재시작 시 아이템 재생성
        this.eventManager.on(GameConfig.EVENTS.GAME_RESTART, () => {
            this.reset();
            this.createItems();
        }, this);
    }
    
    /**
     * 아이템 생성 (설정 파일의 위치 사용)
     */
    createItems() {
        // 기존 아이템 제거
        this.dispose();
        
        GameConfig.ITEM_POSITIONS.forEach((pos, index) => {
            const position = new THREE.Vector3(pos.x, pos.y, pos.z);
            const item = new Item(this.scene, position, index);
            this.items.push(item);
        });
        
        console.log(`Created ${this.items.length} items`);
    }
    
    /**
     * 아이템 업데이트
     */
    update(delta) {
        this.items.forEach(item => {
            item.update(delta);
        });
    }
    
    /**
     * 플레이어가 수집 가능한 아이템 찾기
     * @param {THREE.Vector3} playerPos - 플레이어 위치
     * @param {THREE.Vector3} playerDirection - 플레이어가 보는 방향
     */
    getCollectableItem(playerPos, playerDirection) {
        for (const item of this.items) {
            if (item.canCollect(playerPos, playerDirection)) {
                return item;
            }
        }
        return null;
    }
    
    /**
     * 아이템 수집 시도
     * @param {THREE.Vector3} playerPos - 플레이어 위치
     * @param {THREE.Vector3} playerDirection - 플레이어가 보는 방향
     */
    tryCollect(playerPos, playerDirection) {
        const item = this.getCollectableItem(playerPos, playerDirection);
        
        if (item) {
            item.collect();
            this.collectedCount++;
            
            // 아이템 수집 이벤트 발생
            this.eventManager.emit(GameConfig.EVENTS.ITEM_COLLECTED, {
                index: item.index,
                collected: this.collectedCount,
                total: this.totalItems
            });
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 모든 아이템을 수집했는지 확인
     */
    isAllCollected() {
        return this.collectedCount >= this.totalItems;
    }
    
    /**
     * 수집 진행률 반환
     */
    getProgress() {
        return {
            collected: this.collectedCount,
            total: this.totalItems,
            percentage: (this.collectedCount / this.totalItems) * 100
        };
    }
    
    /**
     * 아이템 상태 초기화
     */
    reset() {
        this.dispose();
        this.collectedCount = 0;
    }
    
    /**
     * 모든 아이템 제거
     */
    dispose() {
        this.items.forEach(item => {
            item.remove();
        });
        this.items = [];
    }
}
