@echo off
echo Running test: Run JSON
curl -X POST http://localhost:3001/run -H "Content-Type: application/json" -d "{\"action\":\"run-json\",\"data\":{\"sample\":\"This is a test payload.\"}}"
pause
