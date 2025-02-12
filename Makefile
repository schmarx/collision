run:
	gcc -O3 -IC:\SFML\CSFML\include -Wall -pedantic -c -o ./bin/main.o main.c
	gcc -O3 ./bin/main.o -o bin/main.exe -LC:\SFML\SFML-2.6.2\lib -LC:\SFML\CSFML\lib\gcc -lcsfml-audio -lcsfml-graphics -lcsfml-system -lcsfml-window -lsfml-audio -lsfml-graphics -lsfml-system -lsfml-window
	./bin/main.exe