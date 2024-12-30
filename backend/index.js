import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "nrhe8194",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];
let currentUserId = 1;

async function checkVisited() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function getCurrentUser(params) {
  const res = await db.query("select * from users");
  users = res.rows;
  const currentUser = users.find((user) => user.id === currentUserId);
  if (!currentUser) {
    throw new Error("Current user not found");
  }
  return currentUser;
}

// api to get country code and current user

app.get("/code", async (req, res) => {
  try {
    const countries = await checkVisited();
    let currentUser;

    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.warn("No current user found. Setting default values.");
      currentUser = { color: null }; // Default or fallback value
    }

    res.json({
      countries: countries,
      users: users,
      total: countries.length,
      color: currentUser.color,
    });
    console.log(countries, users);
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/visited", async (req, res) => {
  const input = req.body["country"];

  if (!input) {
    return res.status(400).json({ error: "Country input is required" });
  }

  try {
    // Find the country code in the database
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
      [input.toLowerCase()]
    );

    if (result.rows.length !== 0) {
      const countryCode = result.rows[0].country_code;

      // Insert the country code into visited_countries table
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1,$2)",
        [countryCode, currentUserId]
      );

      return res.status(200).json({ message: "Country added successfully" });
    } else {
      return res.status(404).json({ error: "Country not found" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "failed to add country" });
  }
});

app.post("/user/switchUser", async (req, res) => {
  const { userId } = req.body;
  currentUserId = userId;
  res.json({ success: true });
});

app.post("/newUser", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;

  try {
    const existingUser = await db.query("SELECT * FROM users WHERE name = $1", [
      name,
    ]);
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Name already exists. Please choose another name." });
    }
    const result = await db.query(
      "insert into users(name, color) values($1, $2)  RETURNING id",
      [name, color]
    );

    const id = result.rows[0].id;
    currentUserId = id;
    console.log("user added");
    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Failed to add new user" });
  }
});

app.delete("/deleteUser/:id", async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ error: "User id is required" });
  }
  try {
    await db.query("delete from users where id = $1 Returning id", [userId]);
    res.json({ success: true });
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(500).json({ error: "failed to delete user" });
  }
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
