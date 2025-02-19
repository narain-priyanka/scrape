import express, { Request, Response } from 'express';
import puppeteer from "puppeteer";
import { scrapedJobListing, scrapedJobDescription } from "./scraper";

const app = express();
const PORT = process.env.PORT || 8083;

app.get("/scrape", async (req: Request, res: Response): Promise<void> => {
    console.log("Received request at /scrape");
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        const jobListings = await scrapedJobListing(page);
        console.log(`Scraped ${jobListings.length} job listings`);

        const updatedJobListings = await scrapedJobDescription(jobListings, page);
        // console.log(JSON.stringify(updatedJobListings, null, 2));
        res.json(updatedJobListings);
    } catch (error) {
        console.error("Error in /scrape:", error);
        res.status(500).json({ error: "Scraping failed", details: (error as Error).message });
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed");
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export { app };