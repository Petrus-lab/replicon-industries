@echo off
echo Running test: Write File
curl -X POST http://localhost:3001/run -H "Content-Type: application/json" -d "{\"action\":\"write-file\",\"data\":{\"filename\":\"file outputs\\ai-output-test.txt\",\"contents\":\"This was written by the AI runner.\"}}"
pause
