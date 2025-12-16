// utils/alarmSound.ts
let alarmAudio: HTMLAudioElement | null = null;

export function playNotificationSound() {
    if (!alarmAudio) {
        alarmAudio = new Audio('/sounds/notification.mp3');
        alarmAudio.loop = false;
    }

    alarmAudio.play().catch((error) => {
        console.error('Failed to play alarm:', error);
    });
}

export function stopAlarmSound() {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
    }
}
