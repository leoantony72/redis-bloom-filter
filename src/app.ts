import express, { Response, Request} from "express";
import cors from "cors";
const Redis = require("ioredis");
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const check_key = `checkusername`; //rediskey

app.post("/", async (req: Request, res: Response) => {
  const { username } = req.body;
  const checkusername = await redis.call("BF.EXISTS", check_key, username); // @Checks the value is present in bloom filter (NO OR might BE PRESERNT)
  if (!checkusername) {
    const Addusername = await redis.call("BF.ADD", check_key, username); // @Adds the value to bloom filter
    return res.json({ success: "Username Added" });
  }
  res.json({ error: "Username alredy taken" });
});

//add mock data to bloom filter
app.get("/add", (req: Request, res: Response) => {
  const fs = require("fs");
  let jsonData: any = {};
  fs.readFile("./MOCK_DATA.json", "utf-8", async (err: any, data: any) => {
    if (err) throw err;
    jsonData = JSON.parse(data);
    const names: any = [];
    jsonData.forEach(async (username: any) => {
      names.push(username.last_name);
    });
    const adddata = await redis.call("BF.MADD", check_key, names);
    res.json({ success: "Usernames Added" });
  });
});

app.listen(5100, () => {
  console.log(`server started at http;//localhost:5100`);
});
