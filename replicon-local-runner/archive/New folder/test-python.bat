@echo off
echo Running test: Run Python
curl -X POST http://localhost:3001/run -H "Content-Type: application/json" -d "{\"action\":\"run-python\",\"data\":\"print('Hello from Python')\"}"
pause
