CREATE DATABASE scheme_servis;
USE scheme_servis;

CREATE TABLE description_chips(
	chip_id int PRIMARY KEY,
	name nchar(20) NOT NULL,
	description nchar(100) DEFAULT 'нет описания' NOT NULL,
	image blob NOT NULL
);
CREATE TABLE chips(
	project_id int FOREIGN KEY REFERENCES projects(project_id),
	chip_id int FOREIGN KEY REFERENCES description_chips(chip_id),
	position_x int NOT NULL,
	position_y int NOT NULL
);
CREATE TABLE projects(
	project_id int PRIMARY KEY,
	name nchar(40) NOT NULL,
	user_id int FOREIGN KEY REFERENCES users(user_id)
);
CREATE TABLE users(
	user_id int PRIMARY KEY,
	name nchar(20) NOT NULL,
	email nchar(40) NOT NULL,
	password nchar(40) NOT NULL
);
GO