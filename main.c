#include "SFML/Audio.h"
#include "SFML/Graphics.h"
#include "SFML/Window.h"
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define rng(max) rand() % (max + 1)

typedef struct {
	sfCircleShape *shape;

	sfVector2f pos;
	sfVector2f vel;
	sfVector2f vel_next;
	sfVector2f acc;

	float r;
	float m;
} obj;

obj *objs;
sfRenderWindow *window;
sfRenderStates states;
sfEvent event;

// TODO: double rather than float?
float C = 0;
float PI = 3.1415926535897932384626433832795;
int count = 1000;
float damping = 0.8;

int max_x = 1000;
int max_y = 1000;

void draw(float dt) {
	for (int i = 0; i < count; i++) {
		obj object = objs[i];
		sfCircleShape *shape = objs[i].shape;

		sfVector2f vel = objs[i].vel;

		objs[i].pos.x += objs[i].vel.x * dt;
		objs[i].pos.y += objs[i].vel.y * dt;

		if (objs[i].pos.y > max_y - object.r) {
			objs[i].pos.y = max_y - object.r;
			objs[i].vel.y *= -damping;
		} else if (objs[i].pos.y < object.r) {
			objs[i].pos.y = object.r;
			objs[i].vel.y *= -damping;
		}

		if (objs[i].pos.x > max_x - object.r) {
			objs[i].pos.x = max_x - object.r;
			objs[i].vel.x *= -damping;
		} else if (objs[i].pos.x < object.r) {
			objs[i].pos.x = object.r;
			objs[i].vel.x *= -damping;
		}

		objs[i].vel.x += objs[i].acc.x * dt;
		objs[i].vel.y += objs[i].acc.y * dt;

		objs[i].vel_next.x = objs[i].vel.x;
		objs[i].vel_next.y = objs[i].vel.y;

		sfShape_setPosition(shape, objs[i].pos);
		sfRenderWindow_drawCircleShape(window, shape, &states);
	}
}

void interactions() {
	for (int i = 0; i < count; i++) {
		for (int j = i + 1; j < count; j++) {

			float dx = objs[i].pos.x - objs[j].pos.x;
			float dy = objs[i].pos.y - objs[j].pos.y;

			float d = sqrt(dx * dx + dy * dy);

			float closeness = (objs[j].r + objs[j].r) - d;
			if (closeness >= 0) {
				collide(i, j, objs);

				// move the objects away from eachother

				objs[i].pos.x += dx * closeness / (2 * d);
				objs[j].pos.x -= dx * closeness / (2 * d);

				objs[i].pos.y += dy * closeness / (2 * d);
				objs[j].pos.y -= dy * closeness / (2 * d);
			}
		}

		objs[i].vel.x = objs[i].vel_next.x;
		objs[i].vel.y = objs[i].vel_next.y;
	}
}

void collide(int i1, int i2, obj *objs) {
	sfVector2f pos1 = objs[i1].pos;
	sfVector2f pos2 = objs[i2].pos;

	float dx = pos1.x - pos2.x;
	float dy = pos1.y - pos2.y;
	float d = sqrt(dx * dx + dy * dy);

	float nx = dx / d;
	float ny = dy / d;

	float pre = (1 + C) * objs[i1].m * objs[i2].m / (objs[i1].m + objs[i2].m);

	float Jn = pre * ((objs[i2].vel.x - objs[i1].vel.x) * nx + (objs[i2].vel.y - objs[i1].vel.y) * ny);

	// if (Jn / objs[i1].m < 2) return;
	objs[i1].vel_next.x += Jn * nx / objs[i1].m;
	objs[i1].vel_next.y += Jn * ny / objs[i1].m;

	objs[i2].vel_next.x -= Jn * nx / objs[i2].m;
	objs[i2].vel_next.y -= Jn * ny / objs[i2].m;
}

void init() {
	sfVideoMode mode = {max_x, max_y};
	window = sfRenderWindow_create(mode, "Collision", sfResize | sfClose, NULL);
	states = sfRenderStates_default();

	objs = malloc(sizeof(obj) * count);

	float r = 10;
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
		sfVector2f vel_next = {0};

		objs[i].pos = pos;
		objs[i].vel = vel;
		objs[i].acc = acc;

		objs[i].shape = shape;
		objs[i].r = r;
		objs[i].m = PI * r * r;
	}
}

int main(int argc, char *argv[]) {
	init();
	// sfRenderWindow_setVerticalSyncEnabled(window, 1);
	// sfRenderWindow_setFramerateLimit(window, 10);

	time_t start_time = time(NULL);
	time_t curr_time = start_time;
	int frames = 0;

	sfClock *timer = sfClock_create();
	sfClock *logger = sfClock_create();
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
				free(objs);
				sfRenderWindow_close(window);
			}
		}

		sfRenderWindow_clear(window, sfBlack);

		float dt = (float)sfClock_restart(timer).microseconds / 100000;

		sfInt64 t0 = sfClock_restart(logger).microseconds;
		draw(dt);
		sfInt64 t1 = sfClock_restart(logger).microseconds;
		interactions();
		sfInt64 t2 = sfClock_restart(logger).microseconds;

		printf("draw: %ius\tcollide: %ius\n", t1, t2);

		sfRenderWindow_display(window);
	}
	return EXIT_SUCCESS;
}