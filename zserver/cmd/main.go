package main

import (
	"ecom/go/app"
	"log"
)

func main() {
	log.Println("Starting server on :1234...")
	if err := app.Init().Engine.Run(":2000"); err != nil {
		log.Fatal("Server error:", err)
	}
}
