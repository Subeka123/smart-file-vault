import express, { Request, Response } from "express";
import Busboy from "busboy";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


app.use("/uploads", express.static(uploadDir));

app.post("/upload", (req: Request, res: Response) => {

  const busboy = Busboy({ headers: req.headers });

  let savedFileName = "";
 let fileWritePromise: Promise<void> | null = null;
  busboy.on("file", (_fieldname, file, filename) => {
    const uniqueName = Date.now() + "-" + filename.filename;
    const saveTo = path.join(uploadDir, uniqueName);

    savedFileName = uniqueName;
    const writeStream = fs.createWriteStream(saveTo);

    file.pipe(writeStream);

   fileWritePromise = new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });


  });

  busboy.on("finish", async () => {

    try {
      if (fileWritePromise) {
        await fileWritePromise;   // ⬅️ Wait for file write
        return res.json({
          message: "File uploaded successfully",
          fileName: savedFileName
        });
      } else {
        return res.status(400).json({ message: "No file uploaded" });
      }
    } catch (err) {
      return res.status(500).json({ message: "File write failed" });
    }

  });

  req.pipe(busboy);
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});