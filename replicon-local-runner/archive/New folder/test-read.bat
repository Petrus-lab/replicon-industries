@echo off
echo Running test: Read File
curl -X POST http://localhost:3001/run -H "Content-Type: application/json" -d "{\"action\":\"read-file\",\"data\":\"file outputs\\dirlist.txt\"}"
pause
