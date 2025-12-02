/**
 * EventManager - 게임 이벤트 관리
 * Observer Pattern으로 컴포넌트 간 느슨한 결합 유지
 */
export class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * 이벤트 리스너 등록
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 콜백 함수
     * @param {Object} context - 콜백 실행 컨텍스트 (this)
     */
    on(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push({ callback, context });
    }

    /**
     * 이벤트 리스너 제거
     * @param {string} eventType - 이벤트 타입
     * @param {Function} callback - 제거할 콜백 함수
     * @param {Object} context - 콜백 컨텍스트
     */
    off(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) return;

        const listeners = this.listeners.get(eventType);
        const index = listeners.findIndex(
            listener => listener.callback === callback && listener.context === context
        );

        if (index !== -1) {
            listeners.splice(index, 1);
        }

        if (listeners.length === 0) {
            this.listeners.delete(eventType);
        }
    }

    /**
     * 이벤트 발생
     * @param {string} eventType - 이벤트 타입
     * @param {any} data - 이벤트 데이터
     */
    emit(eventType, data = null) {
        if (!this.listeners.has(eventType)) return;

        const listeners = this.listeners.get(eventType).slice();

        listeners.forEach(listener => {
            try {
                listener.callback.call(listener.context, data);
            } catch (error) {
                console.error(`Error in event listener for '${eventType}':`, error);
            }
        });
    }
}
