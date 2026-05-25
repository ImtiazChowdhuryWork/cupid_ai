package services

import (
	"context"
	"log"
	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

var (
	fcmClient *messaging.Client
	fcmOnce   sync.Once
)

// initFCM initialises the Firebase Admin SDK once using the service account file.
func initFCM() *messaging.Client {
	fcmOnce.Do(func() {
		opt := option.WithCredentialsFile("firebase-service-account.json")
		app, err := firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			log.Printf("FCM: failed to init Firebase app: %v", err)
			return
		}
		client, err := app.Messaging(context.Background())
		if err != nil {
			log.Printf("FCM: failed to get Messaging client: %v", err)
			return
		}
		fcmClient = client
		log.Println("FCM: Firebase Admin SDK initialised ✓")
	})
	return fcmClient
}

// SendPush sends a push notification to a single device via FCM V1 API.
func SendPush(_, fcmToken, title, body string) error {
	client := initFCM()
	if client == nil {
		log.Println("FCM: client is nil — Firebase not initialised (check service account file)")
		return nil
	}
	if fcmToken == "" {
		log.Println("FCM: skipping — no FCM token for user")
		return nil
	}
	log.Printf("FCM: sending '%s' to token %s…", title, fcmToken[:20])

	msg := &messaging.Message{
		Token: fcmToken,
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Android: &messaging.AndroidConfig{
			Priority: "high",
			Notification: &messaging.AndroidNotification{
				Sound:       "default",
				ClickAction: "FLUTTER_NOTIFICATION_CLICK",
			},
		},
	}

	_, err := client.Send(context.Background(), msg)
	if err != nil {
		log.Printf("FCM: send error: %v", err)
		return err
	}
	log.Printf("FCM: notification sent to %s…", fcmToken[:12])
	return nil
}
