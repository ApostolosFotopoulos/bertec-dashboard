package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"strings"
	"time"
)

type Event struct {
	Name  string `json:"name"`
	Left  string `json:"left"`
	Right string `json:"right"`
	Data  string `json:"data"`
}

func main() {

	// Create a server at localhost and with port listening to 54221
	const PORT = "localhost:54221"
	l, err := net.Listen("tcp", PORT)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer l.Close()
	fmt.Println("[INFO] Server created and waiting for clients....")

	// Wait until a client shows up
	c, err := l.Accept()
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("[INFO] Client is connected...")
	fmt.Println(c)

	// Read the csv with the data from the force plates
	file, err := os.Open("../../mocks/both_loaded_walk_trial_1.csv")
	if err != nil {
		fmt.Println(err)
	}
	reader := csv.NewReader(file)
	records, _ := reader.ReadAll()
	currentIndex := 0
	collectedRows := 0
	samplingFrequency := 10

	//fmt.Println(records)
	for {

		if collectedRows == samplingFrequency {
			// Send the record to the client
			currentMetrics := records[currentIndex%len(records)]
			fmt.Println(currentMetrics)
			event := Event{"FORCE_PLATES_EVENT", "62307970739173", "82581949806217", strings.Join(currentMetrics, "")}
			d, err := json.Marshal(event)

			if err != nil {
				fmt.Println(err)
			}

			fmt.Println(string(d))
			c.Write(d)
			collectedRows = 0
		}

		if currentIndex == len(records) {
			currentIndex = 0
		}

		currentIndex += 1
		collectedRows += 1
		time.Sleep(1 * time.Millisecond)
	}
}
