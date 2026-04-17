package main

import (
	"ecom/go/app"
	"log"
)

func main() {
	log.Println("Starting server on :2004...")
	if err := app.Init().Engine.Run(":2004"); err != nil {
		log.Fatal("Server error:", err)
	}
}
