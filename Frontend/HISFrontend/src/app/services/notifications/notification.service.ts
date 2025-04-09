import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }


    /** 
   * Requests permission from the user to show notifications in the browser.
   * Only prompts when the permission state is default
   */
  requestPermission(): void {
    // Check if the browser supports the notification API

    if (!('Notification' in window)) {
      console.warn('Notifications are not supported by this browser.');
      return;
    }

    // Request permission only if its not already granted or denied

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission =>
        console.log('Notification permission:', permission)
      );
    }
  }

  // Displays a browser notification with the given title and options (icon, body)

  showNotification(title: string, options?: NotificationOptions): void {
        // Exit if notifications are not supported

    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, options);
      return;
    }

  // If permission is default request it and show notification if granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
  }
}
