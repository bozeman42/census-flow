CREATE TABLE "states" (
	"state_id" VARCHAR(3) PRIMARY KEY,
	"name" VARCHAR(80)
);

CREATE TABLE "counties" (
	"geoid" VARCHAR(5) PRIMARY KEY,
	"state_id" VARCHAR(3) REFERENCES "states",
	"name" VARCHAR(80)
);

CREATE TABLE "movement" (
	"id" SERIAL PRIMARY KEY,
	"from" VARCHAR(5) REFERENCES "counties",
	"to" VARCHAR(5) REFERENCES "counties",
	"quantity" INTEGER
);