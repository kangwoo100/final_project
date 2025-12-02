/**
 * EventManager - 게임 이벤트 관리
 * Observer Pattern 구현으로 컴포넌트 간 느슨한 결합 유지
 */
export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
    }

    /**
     * 이벤트 리스너 등록
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 콜백 함수
     * @param {Object} context - 콜백 실행 컨텍스트 (this)
     * @returns {Function} - 리스너 제거 함수
     */
    on(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        const listener = { callback, context };
        this.listeners.get(eventType).push(listener);

        // 리스너 제거 함수 반환 (구독 취소용)
        return () => this.off(eventType, callback, context);
    }

    /**
     * 일회성 이벤트 리스너 등록
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 콜백 함수
     * @param {Object} context - 콜백 실행 컨텍스트
     */
    once(eventType, callback, context = null) {
        const onceWrapper = (data) => {
            this.off(eventType, onceWrapper);
            callback.call(context, data);
        };
        this.on(eventType, onceWrapper, context);
    }

    /**
     * 이벤트 리스너 제거
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 제거할 콜백 함수
     * @param {Object} context - 콜백 컨텍스트
     */
    off(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) {
            return;
        }

        const listeners = this.listeners.get(eventType);
        const index = listeners.findIndex(
            listener => listener.callback === callback && listener.context === context
        );

        if (index !== -1) {
            listeners.splice(index, 1);
        }

        // 리스너가 없으면 맵에서 제거
        if (listeners.length === 0) {
            this.listeners.delete(eventType);
        }
    }

    /**
     * 특정 타입의 모든 리스너 제거
     * @param {string} eventType - 이벤트 타입
     */
    offAll(eventType) {
        this.listeners.delete(eventType);
    }

    /**
     * 이벤트 발생 (동기)
     * @param {string} eventType - 이벤트 타입
     * @param {any} data - 이벤트 데이터
     */
    emit(eventType, data = null) {
        if (!this.listeners.has(eventType)) {
            return;
        }

        const listeners = this.listeners.get(eventType).slice(); // 복사본 사용

        listeners.forEach(listener => {
            try {
                listener.callback.call(listener.context, data);
            } catch (error) {
                console.error(`Error in event listener for '${eventType}':`, error);
            }
        });
    }

    /**
     * 이벤트 발생 (비동기, 큐에 추가)
     * @param {string} eventType - 이벤트 타입
     * @param {any} data - 이벤트 데이터
     */
    enqueue(eventType, data = null) {
        this.eventQueue.push({ eventType, data });
    }

    /**
     * 큐에 쌓인 이벤트 처리
     * 게임 루프에서 매 프레임 호출해야 함
     */
    processQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        // 현재 큐의 모든 이벤트 처리
        const events = this.eventQueue.splice(0);
        events.forEach(event => {
            this.emit(event.eventType, event.data);
        });

        this.isProcessing = false;
    }

    /**
     * 모든 리스너 제거
     */
    clear() {
        this.listeners.clear();
        this.eventQueue = [];
    }

    /**
     * 디버깅용: 등록된 리스너 정보 출력
     */
    debug() {
        console.log('=== EventManager Debug ===');
        console.log(`Total event types: ${this.listeners.size}`);
        this.listeners.forEach((listeners, eventType) => {
            console.log(`  ${eventType}: ${listeners.length} listeners`);
        });
        console.log(`Queued events: ${this.eventQueue.length}`);
    }
}
