#include "SFML/Audio.h"
#include "SFML/Graphics.h"
#include "SFML/Window.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(int argc, char *argv[]) {
	sfVideoMode mode = {1200, 1000};
	sfRenderWindow *window = sfRenderWindow_create(mode, "Window", sfResize | sfClose, NULL);

	// sfWindow_setVerticalSyncEnabled(true);
	// sfWindow_setFramerateLimit(window, 200);

	// long start_time = time(NULL);
	// long curr_time = start_time;
	while (sfWindow_isOpen(window)) {
		// curr_time = time(NULL);
		// printf("%ld\n", curr_time - start_time);
		sfEvent *event;
		while (sfWindow_pollEvent(window, event)) {
			if (event->type == sfEvtClosed) {
				sfWindow_close(window);
			}
		}
	}
	return EXIT_SUCCESS;
}