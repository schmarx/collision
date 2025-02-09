#include "SFML/Audio.h"
#include "SFML/Graphics.h"
#include "SFML/Window.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define rng(max) rand() % (max + 1)

typedef struct {
	sfCircleShape *shape;
	sfVector2f vel;
	sfVector2f acc;
} obj;

int main(int argc, char *argv[]) {
	int max_x = 1200;
	int max_y = 1000;

	sfVideoMode mode = {max_x, max_y};
	sfRenderWindow *window = sfRenderWindow_create(mode, "Collision", sfResize | sfClose, NULL);
	sfEvent event;

	// sfRenderWindow_setVerticalSyncEnabled(window, 1);
	// sfRenderWindow_setFramerateLimit(window, 10);

	int count = 10000;

	obj *objs = malloc(sizeof(obj) * count);

	float r = 5;
	for (int i = 0; i < count; i++) {
		sfCircleShape *shape = sfCircleShape_create();
		sfVector2f origin = {r, r};

		sfVector2f pos = {rng(max_x), rng(max_y)};
		// sfVector2f pos = {500, 0};

		sfCircleShape_setOrigin(shape, origin);
		sfCircleShape_setPosition(shape, pos);
		sfCircleShape_setRadius(shape, r);
		sfCircleShape_setFillColor(shape, sfWhite);

		sfVector2f acc = {0, 10};
		sfVector2f vel = {rng(100) - 50, rng(100) - 50};

		objs[i].acc = acc;
		objs[i].vel = vel;

		objs[i].shape = shape;
	}

	time_t start_time = time(NULL);
	time_t curr_time = start_time;
	int frames = 0;

	sfClock *timer = sfClock_create();

	sfRenderStates states = sfRenderStates_default();
	while (sfRenderWindow_isOpen(window)) {
		curr_time = time(NULL);
		frames += 1;
		if (curr_time - start_time >= 1) {
			start_time = curr_time;
			printf("%i\n", frames);
			frames = 0;
		}
		while (sfRenderWindow_pollEvent(window, &event)) {
			if (event.type == sfEvtClosed) {
				sfRenderWindow_close(window);
			}
		}

		sfRenderWindow_clear(window, sfBlack);

		double dt = (double)sfClock_restart(timer).microseconds / 100000;

		for (int i = 0; i < count; i++) {
			obj object = objs[i];
			sfCircleShape *shape = objs[i].shape;

			sfVector2f pos = sfCircleShape_getPosition(shape);
			sfVector2f vel = objs[i].vel;

			pos.x += objs[i].vel.x * dt;
			pos.y += objs[i].vel.y * dt;

			if (pos.y > max_y) {
				pos.y = max_y;
				objs[i].vel.y *= -1;
			} else if (pos.y < 0) {
				pos.y = 0;
				objs[i].vel.y *= -1;
			}

			if (pos.x > max_x) {
				pos.x = max_x;
				objs[i].vel.x *= -1;
			} else if (pos.x < 0) {
				pos.x = 0;
				objs[i].vel.x *= -1;
			}

			objs[i].vel.x += objs[i].acc.x * dt;
			objs[i].vel.y += objs[i].acc.y * dt;

			sfShape_setPosition(shape, pos);
			sfRenderWindow_drawCircleShape(window, shape, &states);
		}

		sfRenderWindow_display(window);
	}
	return EXIT_SUCCESS;
}